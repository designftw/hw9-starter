import { readableDate } from "./util.js";

export default {
	message: message => `
	<article id="message-${message.id}">
		<header>
			<h3>
				Sent from <strong>${message.sender}</strong>
				to <strong>${message.recipients.join(", ")}</strong>
			</h3>
			<p>Sent on <time>${readableDate(message.createdAt)}</time>
		</header>
		<p>${message.data.text}</p>
	</article>`
}