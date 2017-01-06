chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		// const courseBlocks = document.getElementsByClassName('course-block');
		const sectionListings = document.getElementsByClassName('section-listing');
		if (sectionListings.length < 1 ) {
			console.log('awaiting classes...');
			return;
		}
		var professors = [];
		for(var i = 0; i < sectionListings.length; i++) {
			const DOMNode = sectionListings[i].childNodes[2].children[1];
			var professor = new profDetails(DOMNode);
			professors.push(professor);
		}
		// We now have the name (and DOMNodes) of each professor on the page in a list.
		professors.forEach((professor, j) => {
			const professorNamesToLookUp = professor.profNames;
			$.post('https://khorram.herokuapp.com/fetchProfessorScore', {professorNamesToLookUp: professorNamesToLookUp.join('_')}) // array
				.done((review) => {
					if(review[0]) {
						// console.log('j: ' + j);
						// console.log(review[0]);
						// If this passes, then this teacher has a review on Rate My Professor.
						addToDOM('p','Grade: ' + review[0].quality + ' out of 5.\n', professor.DOMNode);
						addToDOM('p','Difficulty: ' + review[0].easiness + ' out of 5.\n', professor.DOMNode);
						addToDOM('p','Top-Tag: ' + review[0].topTag + '\n', professor.DOMNode);
						addToDOM('a','Full review', professor.DOMNode, review[0].url);
					}
			})
		})

		function addToDOM(elementType, text, DOMNode, url) {
			var element = document.createElement(elementType);
			if (url) {
				element.setAttribute('href', url);
				element.setAttribute('target', '_blank');
			}
			const elementContent = document.createTextNode(text);
			element.appendChild(elementContent);
			DOMNode.append(element);
		}
		// ----------------------------------------------------------

	}
	}, 10);
});

class profDetails {
	constructor(DOMNode){
		this.DOMNode = DOMNode;
		this.profNames = DOMNode.innerText.substring(DOMNode.innerText.indexOf(':') + 2, DOMNode.innerText.length - 1).split(/[\n\r]/g).filter(this.removeIfEmpty);
	}

	removeIfEmpty(str) {
		if (str.trim().length < 1) return false;
		return true;
	}
}