<script>
    import { onMount } from "svelte";
    import Swal from "sweetalert2/src/sweetalert2.js";
    import "@sweetalert2/theme-dark/dark.min.css";
    import { scrollToBottom } from "./utils";
    import playIcon from "../assets/play.svg";
    import pauseIcon from "../assets/pause.svg";
    import pausePlayIcon from "../assets/pause-play.svg";
    import openIcon from "../assets/open.svg";
    import trashIcon from "../assets/trash.svg";

    const dateify = (s) => new Date(s);
    let tasks = $state(
        (JSON.parse(localStorage.getItem("tasks")) || []).map(
            ({ name, start, pauses, notes }) => ({
                name: name || "\u2014",
                start: dateify(start),
                pauses:
                    pauses == null
                        ? []
                        : pauses.map((pause) => pause.map(dateify)),
                notes: notes || "",
            }),
        ),
    );
    $effect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    });
    const calcDurs = () => {
        const durs = [];
        for (const task of tasks) {
            let pauses = 0;
            let endPause = 0;
            for (const [start, end] of task.pauses) {
                if (end != null) {
                    pauses += end.getTime() - start.getTime();
                } else {
                    endPause = start;
                }
            }
            durs.push((endPause || new Date().getTime()) - task.start - pauses);
        }
        return durs;
    };
    let durations = $state(calcDurs());
    setInterval(() => (durations = calcDurs()), 100);
    const displayMs = (dur) => {
        if (!dur) return "\u2014";
        const s = Math.floor((dur / 1000) % 60),
            m = Math.floor((dur / (1000 * 60)) % 60),
            h = Math.floor((dur / (1000 * 60 * 60)) % 24);
        const comps = [];
        if (h != 0) {
            comps.push(`${h}h`);
        }
        if (m != 0) {
            comps.push(`${m}m`);
        }
        if (s != 0) {
            comps.push(`${s}s`);
        }
        return comps.join(" ") || "\u2014";
    };
    const toggleTask = (i) => {
        const task = tasks[i];
        if (task.pauses.length === 0) {
            tasks[i].pauses.push([new Date()]);
            return;
        }
        const lastPauseIndex = task.pauses.length - 1;
        const lastPause = task.pauses[lastPauseIndex];
        if (lastPause.length === 1) {
            tasks[i].pauses[lastPauseIndex].push(new Date());
            return;
        }
        tasks[i].pauses.push([new Date()]);
    };
    let newTaskInput = $state(null);
    let newTaskName = $state("");
    const addTask = () => {
        const name = newTaskName.trim();
        if (!name) {
            return;
        }
        tasks.push({
            name,
            start: new Date(),
            pauses: [],
            notes: "",
        });
        newTaskName = "";
        scrollToBottom(() => {});
    };
    const newTaskKeyUp = (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    };
    let editing = $state(null);
    let editingInput = $state(null);
    $effect(() => editing && editingInput.focus());
    const editTaskKeyUp = (e) => {
        if (e.key === "Escape") {
            editing = null;
        } else if (e.key === "Enter") {
            const { name, key } = editing;
            editing = null;
            const i = tasks.findIndex(({ start }) => start === key);
            tasks[i].name = name;
        }
    };

    onMount(() => scrollToBottom(() => newTaskInput.focus()));
</script>

<h1 style="margin-bottom: 0">TimeTrack</h1>
<hr style="margin-bottom: 20px" />
{#if tasks.length}
    <table id="tasks-table">
        <thead>
            <tr>
                <th>name</th>
                <th>notes</th>
                <th>start</th>
                <th>duration</th>
                <th>
                    <img
                        src={pausePlayIcon}
                        alt="Pause/resume"
                        style="width: 22px"
                    />
                </th>
                <th class="button-cell">
                    <button
                        class="delete"
                        onclick={() =>
                            Swal.fire({
                                icon: "warning",
                                title: `delete ALL TASKS?`,
                                showDenyButton: true,
                                denyButtonText: "yes, delete",
                                confirmButtonText: "no, keep them!",
                            }).then((res) =>
                                res.isDenied ? (tasks = []) : null,
                            )}
                    >
                        <img src={trashIcon} alt="Delete" />
                    </button>
                </th>
            </tr>
        </thead>
        <tbody>
            {#each tasks as task, i (task.start)}
                {@const paused = !(
                    task.pauses.length === 0 ||
                    task.pauses[task.pauses.length - 1].length === 2
                )}
                {@const pauseResumeIcon = paused ? playIcon : pauseIcon}
                {@const pauseResumeAlt = paused ? "Resume" : "Pause"}
                <tr>
                    <td>
                        {#if editing && editing.key === task.start}
                            <input
                                class="general-input"
                                placeholder="new task name"
                                onkeyup={editTaskKeyUp}
                                onfocusout={() => (editing = null)}
                                bind:value={editing.name}
                                bind:this={editingInput}
                            />
                        {:else}
                            <button
                                class="task-name-button"
                                onclick={() =>
                                    (editing = {
                                        name: task.name,
                                        key: task.start,
                                    })}
                            >
                                {task.name}
                            </button>
                        {/if}
                    </td>
                    <td>
                        <button
                            style="background-color: transparent; border: none; padding: 0px"
                            aria-label="Open notes"
                            onclick={() =>
                                Swal.fire({
                                    title: `notes for <em>${task.name}</em>`,
                                    html: `
<textarea id="task-notes-input" placeholder="enter notes for '${task.name}'"></textarea>
<style>
    #task-notes-input {
        min-width: 80%;
        min-height: 70px;
        color: whitesmoke;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
        background-color: #444;
        border: 1px solid #222;
        border-radius: 8px;
        transition-duration: 200ms;
    }

    #task-notes-input::placeholder {
        color: #888;
    }

    #task-notes-input:focus {
        border: 1px solid lightgray;
        outline: none;
    }
</style>
`,
                                    focusConfirm: false,
                                    didOpen: () =>
                                        (document.getElementById(
                                            "task-notes-input",
                                        ).value = task.notes || ""),
                                    preConfirm: () =>
                                        (task.notes =
                                            document.getElementById(
                                                "task-notes-input",
                                            ).value),
                                    confirmButtonText: "confirm",
                                    customClass: {
                                        confirmButton: "task-notes-ok-button",
                                    },
                                })}
                        >
                            <img class="open-icon" src={openIcon} alt="Open" />
                        </button>
                    </td>
                    <td>{task.start.toLocaleString()}</td>
                    <td>{displayMs(durations[i])}</td>
                    <td>
                        <button
                            class="pause-play"
                            onclick={() => toggleTask(i)}
                        >
                            <img src={pauseResumeIcon} alt={pauseResumeAlt} />
                        </button>
                    </td>
                    <td class="button-cell">
                        <button
                            class="delete"
                            onclick={() =>
                                Swal.fire({
                                    icon: "warning",
                                    title: `delete <em>${task.name}</em>?`,
                                    showDenyButton: true,
                                    denyButtonText: "yes, delete",
                                    confirmButtonText: "no, keep it!",
                                }).then((res) =>
                                    res.isDenied ? tasks.splice(i, 1) : null,
                                )}
                        >
                            <img src={trashIcon} alt="Delete" />
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    no tasks!<br /><br />add one below:
{/if}
<div style="margin: 1rem 0px 2rem 0px">
    <input
        class="general-input"
        type="text"
        placeholder="task name"
        bind:this={newTaskInput}
        bind:value={newTaskName}
        onkeyup={newTaskKeyUp}
    />
    <button class="add" onclick={addTask} disabled={!newTaskName.trim()}
        >add</button
    >
</div>

<!-- {#if !tasks.length}
    or import your tasks:&emsp;
    <input class="general-input" type="text" placeholder="save string" />
{/if} -->

<style>
    #tasks-table {
        min-width: 50%;
        border-collapse: collapse;
    }

    #tasks-table th,
    #tasks-table td {
        border: 1px solid lightgray;
        padding: 8px;
    }

    #tasks-table td {
        text-align: center;
    }

    #tasks-table .button-cell {
        border: none;
        padding: 4px;
    }

    .task-name-button {
        height: 100%;
        width: 100%;
        background-color: transparent;
        color: whitesmoke;
        border: none;
        padding: 0px;
        margin: 0px;
        font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            "Open Sans",
            "Helvetica Neue",
            sans-serif;
        font-size: 12pt;
    }

    .open-icon {
        width: 20px;
        filter: none;
        transition-duration: 50ms;
    }

    .open-icon:hover {
        filter: brightness(60%);
    }

    button {
        padding: 8px 16px;
        border-radius: 16px;
        transition-duration: 200ms;
    }

    button:focus {
        outline: none;
    }

    button.pause-play,
    .button-cell button.delete {
        background-color: transparent;
        border: none;
        padding: 0px;
    }

    button.pause-play img {
        width: 28px;
        filter: none;
        transition-duration: 50ms;
    }

    button.pause-play img:hover {
        filter: brightness(60%);
    }

    .button-cell button.delete {
        margin-left: 8px;
    }

    .button-cell button.delete img {
        width: 20px;
        filter: none;
        transition-duration: 20ms;
    }

    .button-cell button.delete img:hover {
        filter: brightness(0) saturate(100%) invert(58%) sepia(98%)
            saturate(1852%) hue-rotate(320deg) brightness(103%) contrast(101%);
    }

    button.add {
        color: #00ff00;
        background-color: #333;
        border: 1px solid #00ff00;
    }

    button.add:hover {
        color: darkgreen;
        background-color: #00ff00;
    }

    button.add:disabled {
        color: #aaa;
        background-color: #eee;
        border-color: lightgray;
    }

    .general-input {
        min-height: 36px;
        min-width: 16%;
        color: whitesmoke;
        background-color: #444;
        border: 1px solid #222;
        border-radius: 8px;
        transition-duration: 200ms;
    }

    .general-input::placeholder {
        color: #888;
    }

    .general-input:focus {
        border: 1px solid lightgray;
        outline: none;
    }
</style>
