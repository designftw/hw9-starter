import Client from "https://designftw.github.io/chat-lib/src/Client.js";
// import Client from "http://localhost:8002/designftw/chat-lib/src/Client.js";
import {$, $$, getFormData} from "./util.js";
import templates from "./templates.js";

/**
 * the host of the server
 */
const SERVER_HOST = "https://messaging-server.csail.mit.edu";

// Root element, just for brevity
const root = document.documentElement;

/**
 * Called when the client logs in. Passes in the client and currently logged in account.
 * @param {Account} account the currently logged in account
 */
async function onLogin(account) {
	$$(".my-username").forEach(el => el.textContent = account.handle);
}

/**
 *  -------------------- The code below is for auth --------------------
 */

/**
 * Called when the document is loaded. Creates a Client and adds auth flow
 * event handling.
 */
let client = new Client(SERVER_HOST);

// Make client a global for easy debugging from the console
globalThis.client = client;

// Holds the handle of the current recipient
let currentRecipient;

root.addEventListener("click", evt => {
	// Enable data-show-dialog attribute
	let showDialog = evt.target.closest("[data-show-dialog]");

	if (showDialog) {
		const dialog = document.getElementById(showDialog.getAttribute("data-show-dialog"));

		if (dialog) {
			evt.preventDefault();
			dialog.showModal();
		}
		else {
			console.warn(`No dialog found with id '${showDialog.getAttribute("data-show-dialog")}'`);
		}
	}

	// Enable elements with .close class to close their ancestor dialog
	if (evt.target.closest(".close")) {
		evt.preventDefault();
		const dialog = evt.target.closest("dialog");
		dialog?.close(); // Not sure what ?. does? See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
	}

	if (evt.target.closest(".logout")) {
		evt.preventDefault();
		client.logout();
	}
})

// Add signup form handlers

// try to signup when the user submits the signup form
signup_form.addEventListener("submit", async evt => {
	evt.preventDefault();

	let data = getFormData(signup_form);

	let errorContainer = signup_form.querySelector(".error");
	errorContainer.innerHTML = "";

	try {
		await client.signup(data.handle, data.email, data.password);
	}
	catch (err) {
		// if there is an error display the error in the form
		errorContainer.innerHTML = err.message;

		evt.preventDefault();
	}
});

// try to login when the user submits the login form
login_form.addEventListener("submit", async evt => {
	const email = login_form.elements["email"].value;
	const password = login_form.elements["password"].value;
	let error = "";

	try {
		await client.login(email, password);
	}
	catch (err) {
		// if there is an error display the error in the form
		error = err.message;
	}

	login_form.querySelector(".error").innerHTML = error;
});

chat_with_form.addEventListener("submit", async evt => {
	evt.preventDefault();

	let data = getFormData(chat_with_form);

	let me = client.account.handle;
	let them = currentRecipient = data.handle;

	document.documentElement.classList.add("has-recipient");

	let oldMessages = await client.getMessages({participants: [me, them]});

	// Display existing messages between me and that recipient
	messages_list.innerHTML = oldMessages.map(templates.message).join("\n");
});

send_message_form.addEventListener("submit", async evt => {
	evt.preventDefault();

	let data = getFormData(send_message_form);

	try {
		let message = await client.sendMessage({
			from: data.handle,
			to: currentRecipient,
			data: {
				text: data.message
			}
		});

		messages_list.insertAdjacentHTML("afterbegin", templates.message(message));
	}
	catch (err) {
		console.error(err);
	}
});

// New message received
client.addEventListener("message", async evt => {
	let {messageId} = evt.detail;
	console.log("New message received, id:", messageId);

	// TODO 1: Get a message object from this message id and display it
});

// TODO 2: Listen for message deletions, find the corresponding element in the DOM and remove it
// (don’t forget to also add UI for deleting messages!)

// update ui to reflect if the client is logged in
let account = await client.getLoggedInAccount();
root.classList.toggle("logged-in", account !== null);

// if client is logged in call account loaded
if (account !== null) {
	onLogin(account);
}

// listen for client login and logout events
client.addEventListener("login", evt => {
	onLogin(evt.detail.account);
	root.classList.add("logged-in");
});

client.addEventListener("logout", evt => {
	root.classList.remove("logged-in", "has-recipient");
	chat_with_form.elements.handle.value = "";
});