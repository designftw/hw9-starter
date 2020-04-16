/**
 * the host of the server
 */
const SERVER_HOST = "https://128.52.128.220";
import Client from "https://designftw.mit.edu/assignments/hw9/js/Client.js";

/**
 * Called when the client logs in. Passes in the client and currently logged in account.
 * @param {Client} client an instance of Client
 * @param {Account} account the currently logged in account
 */
async function onAccountLoggedIn(client, account) {
  /**
   * TODO Students can add code here
   */

  // just to get you started, get all the aliases owned by the account
  const myAliases = await client.getAliasesForAccount();
  // get all the messages for each alias
  for (let alias of myAliases) {
    const aliasMessages = await client.getMessagesForAlias(alias.name);
  }
}

/**
 * Called when the document is loaded. Creates a Client and adds auth flow
 * event handling.
 */
async function initializeClientAndAuthUI() {
  let client = new Client(SERVER_HOST);
  addSignupFormHandlers(client);
  addLoginFormHandlers(client);
  addLogoutFormHandlers(client);

  // update ui to reflect if the client is logged in
  const loginResult = await client.isLoggedIn();
  toggleLoginUI(loginResult.isLoggedIn);

  // if client is logged in call account loaded
  if (loginResult.isLoggedIn) {
    onAccountLoggedIn(client, loginResult.account);
  }
  // listen for client login and logout events
  client.addEventListener("login", (e) => {
    onAccountLoggedIn(client, e.detail);
    toggleLoginUI(true);
  });
  client.addEventListener("logout", (e) => {
    toggleLoginUI(false);
  });
}

// when the DOM is loaded run the initialize code since initialize code
// accesses UI
if (document.readyState == "loading") {
  // DOM not ready so wait for an event to fire
  document.addEventListener("DOMContentLoaded", initializeClientAndAuthUI, {
    once: true,
  });
} else {
  // DOM is ready!
  initializeClientAndAuthUI();
}

/**
 *  -------------------- The code below is for auth --------------------
 */

/**
 * Show and hide the log in ui based on if the user is logged in.
 * @param {boolean} isLoggedIn true if the user is currently logged in
 */
function toggleLoginUI(isLoggedIn) {
  const logoutButton = document.querySelector("#logoutButton");
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signUpButton");

  if (isLoggedIn) {
    // hide login ui
    loginButton.classList.add("isHidden");
    signupButton.classList.add("isHidden");
    // show logout ui
    logoutButton.classList.remove("isHidden");
  } else {
    // show login ui
    loginButton.classList.remove("isHidden");
    signupButton.classList.remove("isHidden");
    // hide logout ui
    logoutButton.classList.add("isHidden");
  }
}

/**
 * Create a handler for the logout button
 * @param {Client} client the chat client for the application
 */
function addLogoutFormHandlers(client) {
  const logoutButton = document.querySelector("#logoutButton");
  if (logoutButton !== null) {
    logoutButton.addEventListener("click", function (event) {
      event.preventDefault();
      client.logout();
      // TODO(lukemurray): handle logout failure
    });
  }
}

/**
 * Create a handler for the login form
 * @param {Client} client the chat client for the application
 */
function addLoginFormHandlers(client) {
  const loginButton = document.querySelector("#loginButton");
  const loginDialog = document.querySelector("#loginDialog");
  const loginForm = document.querySelector("#loginForm");
  const cancelLoginButton = loginForm.querySelector('[type="reset"]');
  // show the login dialog when the user clicks the login button
  loginButton.addEventListener("click", () => {
    loginDialog.showModal();
  });
  // hide the login dialog when the user cancels the login
  cancelLoginButton.addEventListener("click", () => {
    loginDialog.close();
  });
  // try to login when the user submits the login form
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = loginForm.elements["email"].value;
    const password = loginForm.elements["password"].value;
    // login
    client
      .login(email, password)
      .then(() => {
        loginForm.querySelector(".error").innerHTML = "";
        loginDialog.close();
      })
      .catch((err) => {
        // if there is an error display the error in the form
        loginForm.querySelector(".error").innerHTML = err.message;
      });
  });
}

/**
 * Create a handler for the signup form
 * @param {Client} client the chat client for the application
 */
function addSignupFormHandlers(client) {
  const signupButton = document.querySelector("#signUpButton");
  const signupDialog = document.querySelector("#signUpDialog");
  const signupForm = document.querySelector("#signUpForm");
  const cancelSignupButton = signupForm.querySelector('[type="reset"]');
  // show the signup dialog when the user clicks the signup button
  signupButton.addEventListener("click", () => {
    signupDialog.showModal();
  });
  // hide the signup dialog when the user cancels the signup
  cancelSignupButton.addEventListener("click", () => {
    signupDialog.close();
  });
  // try to signup when the user submits the signup form
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const alias = signupForm.elements["alias"].value;
    const email = signupForm.elements["email"].value;
    const password = signupForm.elements["password"].value;
    // signup
    client
      .signup(alias, email, password)
      .then(() => {
        signupForm.querySelector(".error").innerHTML = "";
        signupDialog.close();
      })
      .catch((err) => {
        // if there is an error display the error in the form
        signupForm.getElementsByClassName("error").innerHTML = err.message;
      });
  });
}
