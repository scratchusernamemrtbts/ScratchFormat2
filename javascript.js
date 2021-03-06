// The initial SF app object
// Create the initial formatter element
var sf = {
	formatter: null
};

// Use a simple DOM element to check Scratch 3/2 UI.
sf.version = 3;
if (document.body.children[0].id == "pagewrapper") {
	sf.version = 2;
}

// Create the SF "tags"
// Everything is customizable here.
// (local images don't work yet, but who cares.
// this is the internet.)
sf.tags = [
	{
		"name": "bold",
		"tag": "b",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/bold.svg",
		"fillers": ["[b]", "[/b]"],
		"formatter": function(part1, part2) {
			return "<b>" + part2 + "</b>";
		}
	},
	{
		"name": "italics",
		"tag": "i",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/italic.svg",
		"fillers": ["[i]", "[/i]"],
		"formatter": function(part1, part2) {
			return "<i>" + part2 + "</i>";
		}
	},
	{
		"name": "underline",
		"tag": "u",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/underline.svg",
		"fillers": ["[u]", "[/u]"],
		"formatter": function(part1, part2) {
			return "<u>" + part2 + "</u>";
		}
	},
	{
		"name": "code",
		"tag": "code",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/code-view.svg",
		"fillers": ["[code]", "[/code]"],
		"formatter": function(part1, part2) {
			return "<code>" + part2 + "</code>";
		}
	},
	{
		"name": "color",
		"tag": "color",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/font-color.svg",
		"fillers": ["[color=red]", "[/color]"],
		"formatter": function(part1, part2) {
			return "<span style='color:" + part1 + "'>" + part2 + "</span>";
		}
	},
	{
		"name": "link",
		"tag": "link",
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Editor/link.svg",
		"fillers": ["[link=", "]Link[/link]"],
		"formatter": function(part1, part2) {
			return "<a href='" + part1 + "'  target='_newtab'>" + part2 + "</a>";
		}
	},
	{
		"name": "easteregg",
		"tag": "easteregg",
		"dontshow": true,
		"fillers": ["[easteregg]"],
		"formatter": function(part1, part2) {
			return "<i>Yes? No. Or is it?</i>";
		}
	},
	{
		"name": "help",
		"help": true,
		"src": "https://raw.githubusercontent.com/Remix-Design/RemixIcon/master/icons/Development/bug-line.svg",
		"ignore": true
	}
];

// Firstly, initialize the formatter, and its icons.
// This is executed on the next block
sf.init = function() {
	var textareaFinder = "[name=compose-comment],[name=content]";

	// Helpful first textarea message
	var findFirst = document.querySelectorAll(textareaFinder);
	if (findFirst.length > 0) {
		findFirst[0].placeholder = "Click here to activate ScratchFormat";
	} else {
		// Kill all if there are no textareas
		return;
	}

	sf.formatter = document.createElement("div");
	sf.formatter.id = "formatter";
	for (var t = 0; t < sf.tags.length; t++) {
		if (sf.tags[t].dontshow) {
			// Skip to next part int this loop
			continue;
		}

		var icon = document.createElement("img");
		icon.src = sf.tags[t].src;

		// Help icon
		if (sf.tags[t].help) {
			icon.style.float = "right";
			icon.onclick = function() {
				// Popup message HTML got a bit out of hand here
				if (sf.version == 2) {
					smod.dialogText(
						"ScratchFormat Help",
						`<a href="https://github.com/ScratchFormat/ScratchFormat2/issues" style="color: #12b1e4;">Report issues at our Github</a> If you do not own a Github account, simply comment on my profile <a href="https://scratch.mit.edu/users/pufflegamerz/" style="color: #12b1e4;">@pufflegamerz</a>`,
						sf.version
					);
				} else {
					prompt("Go here to report bugs:", "https://github.com/ScratchFormat/ScratchFormat2/issues");
				}
			}

			sf.formatter.appendChild(icon);
			continue;
		}

		icon.fillers = sf.tags[t].fillers;

		// This may look janky, but with Chrome extensions,
		// Everything is jank. Basically I have to set custom
		// properties to the element in order to get data without
		// having functions, which would require some "injection"
		// garbage.
		icon.onclick = function(event) {
			var textarea = event.target.parentElement.parentElement.children[1];
			var fillers = event.target.fillers;

			// Grab the selected text
			var selection = textarea.value.substring(
				textarea.selectionStart,
				textarea.selectionEnd
			);

			if (selection.length == 0) {
				selection = "text";
			}

			// Generate new text, if just 1 filler, ex [br], don't attempt
			// to use second part.
			var newText = textarea.value.substring(0, textarea.selectionStart)
			if (fillers.length > 1) {
				newText += fillers[0] + selection + fillers[1];
			} else {
				newText += fillers[0];
			}

			newText += textarea.value.substring(textarea.selectionEnd);

			textarea.value = newText;
			textarea.focus();
		}

		sf.formatter.appendChild(icon);
	}

	// Move formatter if user clicks on textarea.
	document.body.onclick = function(event) {
		// Note: duplicate of "textareaFinder"
		if (event.target.name == "content" || event.target.name == "compose-comment") {
			// Check if it already has formatter.
			// A somewhat messy solution, but it is fine.
			if (event.target.parentElement.children[0].id !== "formatter") {
				event.target.parentElement.prepend(sf.formatter);
				sf.formatter.style.width = event.target.offsetWidth + "px";
			}
		}
	}

	// Initial background formatting loop.
	setInterval(function() {
		sf.format();
	}, 300);
}

// This is a 1 second timeout for page load, since I am
// too lazy to figure out real page load times
setTimeout(sf.init, 1000);

// Function to format comments that are not already
// formatted
sf.oldComments = 0;
sf.format = function() {
	// Quit if we already formatted those comments.
	// Checks for last vs new length.
	var comments = document.querySelectorAll(".content, .emoji-text");
	if (sf.oldComments == comments.length) {
		return;
	}

	sf.oldComments = comments.length;

	for (var c = 0; c < comments.length; c++) {
		comments[c].style.whiteSpace = "pre-line";
		if (comments[c].className == "emoji-text") {
			comments[c].style.marginLeft = "3px";
		}

		comments[c].innerHTML = sf.parse(comments[c].innerHTML);
	}
}

// Custom regex SFML* parser. It parses differently than HTML. Instead
// Of replacing [b] with <b>, it it replaces both tags with
// text between them. Therefore, "[b][b]Hello[/b][/b]" will not work.
// It doesn't really matter though, and won't be changed unless it
// is able to cause significant issues in the future.
// *ScratchFormat Markup Language (basically BBCode)
sf.parse = function(text) {
	// Note that the new scratchformat standard is [],
	// and the () is outdated, and a bit harder to type.
	// But, we will detect both for historical reasons
	var startBracket = "[\\(|\\[]";
	var endBracket = "[\\)|\\]]";

	for (var t = 0; t < sf.tags.length; t++) {
		if (sf.tags[t].ignore) {
			continue;
		}

		// First part of tag
		var regex = "";
		regex += startBracket;
		regex += sf.tags[t].tag;
		regex += "[=]*([^\\]\\[\\)\\(]*)";
		regex += endBracket;

		// If just 1 tag (Ex [br])
		if (sf.tags[t].fillers.length > 1) {
			// Lazy matching (?)
			regex += "(.*?)";

			// Second part of tag
			regex += startBracket;
			regex += "\/";
			regex += sf.tags[t].tag;
			regex += endBracket;
		}
		
		regex = new RegExp(regex, "gms");
		text = text.replace(regex, sf.tags[t].formatter("$1", "$2"));
	}

	// Format trailing breaklines and spaces
	text = text.replace(/^(\n| )+/gm, "");

	return text;
}
