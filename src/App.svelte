<script>
    import ghLogo from "./assets/gh.svg";
    import igLogo from "./assets/ig.svg";
    import ccLogo from "./assets/cc.svg";
    import lcLogo from "./assets/lc.svg";

    let newTaskName = $state("");
    const dateify = (s) => new Date(s);
    let tasks = $state(
        (JSON.parse(localStorage.getItem("tasks")) || []).map(
            ({ name, start, pauses }) => ({
                name,
                start: dateify(start),
                pauses: pauses.map((pause) => pause.map(dateify)),
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
    setInterval(() => (durations = calcDurs()), 200);
    const displayMs = (dur) => {
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
    const addTask = () => {
        tasks.push({
            name: newTaskName,
            start: new Date(),
            pauses: [],
        });
        newTaskName = "";
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
</script>

<h1 style="margin-bottom: 0">TimeTrack</h1>
<hr style="margin-bottom: 20px" />
{#if tasks.length}
    <table id="tasks-table">
        <thead>
            <tr>
                <th>name</th>
                <th>start</th>
                <th>duration</th>
                <th>paused</th>
            </tr>
        </thead>
        <tbody>
            {#each tasks as task, i (task.start)}
                {@const paused = !(
                    task.pauses.length === 0 ||
                    task.pauses[task.pauses.length - 1].length === 2
                )}
                {@const button = paused ? "resume" : "pause"}
                <tr>
                    <td>
                        {#if editing && editing.key === task.start}
                            <input
                                class="task-name-input"
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
                    <td>{task.start.toLocaleString()}</td>
                    <td>{displayMs(durations[i])}</td>
                    <td>{paused ? "yes" : "no"}</td>
                    <td class="button-cell">
                        <button
                            class="pause-play"
                            onclick={() => toggleTask(i)}
                        >
                            {button}
                        </button>
                        <button
                            class="delete"
                            onclick={() => tasks.splice(i, 1)}
                        >
                            delete
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    no tasks!
{/if}
<div style="margin-top: 16px;">
    <input
        class="task-name-input"
        type="text"
        placeholder="task name"
        bind:value={newTaskName}
        onkeyup={newTaskKeyUp}
    />
    <button class="add" onclick={addTask} disabled={!newTaskName}>add</button>
</div>
<footer>
    <span>by prawnydagrate</span>
    <div>
        <a
            href="https://github.com/prawnydagrate"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
        >
            <img src={ghLogo} alt="GitHub" />
        </a>
        <a
            href="https://instagram.com/puissant.patzer"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
        >
            <img src={igLogo} alt="Instagram" />
        </a>
        <a
            href="https://chess.com/member/prawnydagrate"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chess.com"
        >
            <img src={ccLogo} alt="Chess.com" />
        </a>
        <a
            href="https://lichess.org/@/prawnydagrate"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Lichess"
        >
            <img src={lcLogo} alt="Lichess" />
        </a>
    </div>
</footer>

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

    button {
        padding: 8px 16px;
        border-radius: 16px;
        transition-duration: 200ms;
    }

    button:focus {
        outline: none;
    }

    .button-cell button.pause-play {
        color: whitesmoke;
        background-color: #333;
        border: 1px solid whitesmoke;
    }

    .button-cell button.pause-play:hover {
        color: whitesmoke;
        background-color: #888;
    }

    .button-cell button.delete {
        color: red;
        background-color: #333;
        border: 1px solid red;
    }

    .button-cell button.delete:hover {
        color: whitesmoke;
        background-color: #ff6464;
        border-color: whitesmoke;
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

    .task-name-input {
        min-height: 36px;
        min-width: 16%;
        color: whitesmoke;
        background-color: #444;
        border: 1px solid #222;
        border-radius: 8px;
        transition-duration: 200ms;
    }

    .task-name-input::placeholder {
        color: #888;
    }

    .task-name-input:focus {
        border: 1px solid lightgray;
        outline: none;
    }

    .task-name-button {
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

    footer {
        display: flex;
        align-items: center;
        justify-content: start;
        position: fixed;
        left: 0px;
        bottom: 0px;
        width: 100%;
        padding: 8px;
        margin: 0;
        background-color: ghostwhite;
        color: #333;
    }

    footer img {
        width: 32px;
    }

    footer > * {
        padding: 4px;
    }
</style>
