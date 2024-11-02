<script>
    import Tasks from "./lib/Tasks.svelte";
    import ghLogo from "./assets/gh.svg";
    import igLogo from "./assets/ig.svg";
    import ccLogo from "./assets/cc.svg";
    import lcLogo from "./assets/lc.svg";
</script>

<div class="container">
    <main>
        <Tasks />
    </main>
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
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        min-height: 100%;
    }

    .container > main {
        flex: 1;
    }

    footer {
        display: flex;
        align-items: center;
        justify-content: start;
        position: sticky;
        left: 0px;
        bottom: 0px;
        width: 100%;
        padding: 8px;
        margin: 0;
        background-color: #222;
        color: whitesmoke;
    }

    footer img {
        width: 32px;
    }

    footer > * {
        padding: 4px;
    }
</style>
