window.onload = () => {
    main();
};

var main = () => {
    renderButton();
    enableDragAndDrop();
};

var renderButton = () => {
    // append custom button
    appendElement('container', '<button id="customButton">Custom</button>');
    var customButton = document.getElementById('customButton');
    customButton.addEventListener("click", toggleCustom);
    // append visible icon
    var blocks = document.getElementsByClassName('block');
    Array.from(blocks).forEach((block) => {
        var visibleIcon = document.createElement("img");
        visibleIcon.className = "visibleIcon";
        visibleIcon.id = block.id + "visibleIcon";
        visibleIcon.src = 'images/eye-open.png';
        visibleIcon.classList.add('hidden') // hide by default
        visibleIcon.addEventListener("click", toggleVisibility); // add event listener
        block.appendChild(visibleIcon);
    });
};

var toggleCustom = () => {
    var customButton = document.getElementById('customButton');
    if (customButton.innerHTML === "Custom") {
        customButton.innerHTML = "Save";
        enableCustomization();
    } else {
        customButton.innerHTML = "Custom";
        saveCustomization();
    }
};
var enableCustomization = () => {
    var blocks = document.getElementsByClassName('block');
    Array.from(blocks).forEach((block) => {
        console.log("enable customization for " + block.id);
        toggleBorder(block);
        toggleIcon(block);
        block.setAttribute('draggable', true);
        if (block.classList.contains('hidden')) {
            block.querySelector('.visibleIcon').src = 'images/eye-close.png';
        }
        block.style.display = "block";
    });
    enableDragAndDrop();
};

var saveCustomization = () => {
    var blocks = document.getElementsByClassName('block');
    Array.from(blocks).forEach((block) => {
        toggleBorder(block);
        toggleIcon(block);
        block.setAttribute('draggable', false);
    });
    enableDragAndDrop(); // disable drag and drop

    // collect current set of blocks
    var visibleBlocks = "";
    var blocks = document.getElementsByClassName('block');
    Array.from(blocks).forEach((block) => {
        var visibleIcon = block.querySelector('.visibleIcon');
        if (visibleIcon.src.endsWith('images/eye-open.png')) {
            visibleBlocks += block.id + ",";
            block.style.display = "block"; // show the block
            block.classList.remove('hidden'); // remove hidden class
        } else {
            block.style.display = "none"; // hide the block
            block.classList.add('hidden'); // add hidden class
        }
    });
    if (visibleBlocks === "") {
        visibleBlocks = "none";
    }
    console.log(visibleBlocks);
    sendBlockSequence(visibleBlocks);
};

var toggleBorder = (block) => {  // toggle between customization mode and save mode
    if (block.classList.contains('border')) {
        block.classList.remove('border');
    }
    else {
        block.classList.add('border');
    }
    
};

var toggleIcon = (block) => {   // toggle between customization mode and save mode
    var visibleIcon = block.querySelector('.visibleIcon');
    if (visibleIcon.classList.contains('hidden')) {
        visibleIcon.classList.remove('hidden');
    } else {
        visibleIcon.classList.add('hidden');
    }
};

var toggleVisibility = (event) => {   // toggle visibility of block (Icon close or open eyes)
    console.log("change visibility of the block" + event.target.id);
    var visibleIcon = event.target;
    var blockID = visibleIcon.id.replace('visibleIcon', '');
    var targetBlock = document.getElementById(blockID);
    
    // change icon and move block to the beginning or end of the container
    if (visibleIcon.src.endsWith('images/eye-close.png')) {
        console.log("change icon to open eyes");
        visibleIcon.src = 'images/eye-open.png';
        targetBlock.style.display = "none"; // remove the block from its original space
        var parentContainer = document.getElementById('container');
        parentContainer.insertBefore(targetBlock, parentContainer.firstChild); // move the block to the beginning of the container
        targetBlock.style.display = "block"; // show the block
    } else {
        visibleIcon.src = 'images/eye-close.png';
        targetBlock.style.display = "none"; // remove the block from its original space
        var parentContainer = document.getElementById('container');
        parentContainer.appendChild(targetBlock); // move the block to the end of the container
        targetBlock.style.display = "block"; // show the block
    }
    
};

var enableDragAndDrop = () => {
    var blocks = document.getElementsByClassName('block');
    Array.from(blocks).forEach((block) => {
        if (block.getAttribute('draggable') === 'true') {
          block.addEventListener("dragstart", dragStart);
          block.addEventListener("dragover", dragOver);
          block.addEventListener("dragleave", dragLeave);
          block.addEventListener("drop", dragDrop);
        } else {
          block.removeEventListener("dragstart", dragStart);
          block.removeEventListener("dragover", dragOver);
          block.removeEventListener("dragleave", dragLeave);
          block.removeEventListener("drop", dragDrop);
        }
    });
};
var dragStart = (event) => {
    // draggedBlock = event.target;
    event.dataTransfer.setData("text/plain", event.currentTarget.id);
};
var dragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
};
var dragLeave = (event) => {
    event.currentTarget.classList.remove('drag-over');
};
var dragDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    var blocksContainer = document.getElementById('container');
    var data = event.dataTransfer.getData("text/plain");
    var draggedBlock = document.getElementById(data);

    // if (draggedBlock && draggedBlock !== event.currentTarget) {
    //     blocksContainer.insertBefore(event.currentTarget, draggedBlock);
    //     // blocksContainer.insertBefore(draggedBlock, event.currentTarget);
    // }
    if (draggedBlock && draggedBlock !== event.currentTarget) {
        var nextSibling = event.currentTarget.nextElementSibling;
        if (nextSibling) {
            blocksContainer.insertBefore(draggedBlock, nextSibling);
        } else {
            blocksContainer.appendChild(draggedBlock);
        }
    }
    draggedBlock = null;
};

var appendElement = (blockID, content) => {
    var block = document.getElementById(blockID);
    block.innerHTML += content;
};

var sendBlockSequence = (visibleBlocks) => {
    var userId = getUserId();
    document.cookie = "visible=" + visibleBlocks + "; expires=" + (new Date(Date.now() + 3000000)).toUTCString() +"; path=/";
    let init = {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, visible: visibleBlocks }),
        headers: {'Content-Type': 'application/json'}
    };

    fetch('index.php', init)
        .then((response) => {
            console.log(response.status);
            if (response.status == 200) {
                console.log("Settings saved successfully");
                document.cookie = "visible=; expires=" + (new Date(Date.now() - 3600000)).toUTCString() + "; path=/;";
            }
            else {
                console.log('Failed to save settings. Status code: ' + response.status);
            }
        })
        .catch((error) => {
            console.log('Request failed', error);
        });
};

var getUserId = () => {
    var userId = getCookie('user_id');
    console.log("get userID: " + userId);
    return userId;
};
var getCookie = (cookieName) => {
    var name = cookieName + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return null;
}
