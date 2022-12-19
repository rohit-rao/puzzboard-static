class SheetLink extends React.Component {
    render() {
        if (this.props.url && this.props.url != "") {
            return React.createElement("a", { href: this.props.url }, "Sheet");
        }
        return React.createElement("button", { onClick: () => createSheet() }, "Create");
    }
}

class Puzzle extends React.Component {
    render() {
        return React.createElement("tr", { className: (this.props.status.toLowerCase() == "solved" ? "table-success" : "") },
            React.createElement("td", null, this.props.title),
            React.createElement("td", null,
                React.createElement("a", { href: this.props.puzzleUrl }, "Puzzle")),
            React.createElement("td", null,
                React.createElement(SheetLink, { url: this.props.sheetUrl })),
            React.createElement("td", null, this.props.answer),
        );
    }
}

class PuzzleHeader extends React.Component {
    render() {
        return React.createElement("thead", null,
            React.createElement("tr", null,
                React.createElement("th", null, "Puzzle"),
                React.createElement("th", null, "Puzzle URL"),
                React.createElement("th", null, "Sheet URL"),
                React.createElement("th", null, "Answer"),
            ),
        );
    }
}

class PuzzleTable extends React.Component {
    render() {
        return React.createElement("table", { className: "table" },
            React.createElement(PuzzleHeader, null),
            React.createElement("tbody", { className: "table-group-divider" },
                this.props.data.map((value, index) =>
                    React.createElement(Puzzle, { key: value[2], title: value[1], puzzleUrl: value[2], sheetUrl: value[3], status: value[4], answer: value[5] })
                ),
            ),
        );
    }
}

class Hunt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            huntName: "Puzzle Boat 9",
            huntUrl: "https://www.pandamagazine.com/island9/",
        }
    }

    render() {
        return React.createElement("div", null,
            React.createElement("h1", null, this.state.huntName),
            React.createElement(PuzzleTable, { data: this.props.puzzleData }),
        );
    }
}

class LoginPrompt extends React.Component {
    render() {
        return React.createElement("button", { onClick: () => handleAuthClick() }, "Log In");
    }
}

class App extends React.Component {
    render() {
        if (this.props.puzzleData) {
            return React.createElement(Hunt, { puzzleData: this.props.puzzleData });
        }
        return React.createElement(LoginPrompt, null)
    }
}

// ========================================

const CLIENT_ID = '653241734859-iir95q9aq9sj228hmpnq2tm3jg6obt9p.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

gapi.load('client', initializeGapiClient);
tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
});

async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: [DISCOVERY_DOC],
    });
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        await fetchPuzzles();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        fetchPuzzles();
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));


async function fetchPuzzles() {
    let response;
    try {
        response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1ipNMRxCcW9SZDlruF6hF05zRhiKKg9SzVUAYBohXvGE',
            range: 'Sheet1!A2:F',
        });
    } catch (err) {
        return;
    }
    const range = response.result;
    if (!range || !range.values || range.values.length == 0) {
        root.render(React.createElement(App, { puzzleData: [] }));
        return;
    }
    root.render(React.createElement(App, { puzzleData: range.values }));
}

root.render(React.createElement(App, null));
