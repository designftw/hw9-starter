let $$ = (selector, container = document) => Array.from(container.querySelectorAll(selector));
let $ = (selector, container = document) => container.querySelector(selector);

// Load data
let storedData = JSON.parse(data.innerHTML);

for (let entry of storedData) {
	addEntry(entry);
}

save_button.addEventListener("click", event => {
	let dataToSave = $$(".entry > form").map(form => {
		let data = new FormData(form);
		return Object.fromEntries(data.entries());
	});

	data.innerHTML = JSON.stringify(dataToSave, null, "\t");
});

add_entry_button.addEventListener("click", event => {
	// Set current date and time as default
	let currentISODate = new Date().toISOString().substring(0, 19); // drop ms and timezone
	addEntry({datetime: currentISODate});
});

function addEntry(data) {
	let entry = entry_template.content.cloneNode(true);

	for (let prop in data) {
		setFormElement(prop, data[prop], entry);
	}

	// Add new entry after "Add entry" button
	add_entry_button.after(entry);
}

function setFormElement(name, value, container) {
	let elements = $$(`[name="${name}"]`, container);

	for (let element of elements) { // only radios will have more than one, but can't hurt
		if (element.type === "checkbox") {
			element.checked = value;
		}
		if (element.type === "radio") {
			element.checked = element.value === value;
		}
		else {
			element.value = value;
		}
	}
}