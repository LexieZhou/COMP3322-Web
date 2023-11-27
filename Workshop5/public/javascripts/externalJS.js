// DOM Ready =============================================================
window.addEventListener('DOMContentLoaded', () => { 
    // Populate the commodity list on initial page load 
    populateCommodityList();
});
// Functions =============================================================
// Fill commodity list with actual data
function populateCommodityList() {
    // Empty content string
    var listCommodity = '<table ><tr><th>Name</th><th>Category</th><th>Status</th><th>Delete?</th></tr>';
    //fetch call for JSON
    fetch('/users/commodities')
    .then(response => {
      response.json().then(data => {
        // Put each item in received JSON collection into a <tr> element
  data.forEach(elm => {
    listCommodity += '<tr><td>' + elm.name + '</td><td>'+
        elm.category +'</td><td id="status_' + elm._id + '">' + 
        elm.status + '<button data="' + 
        elm._id + '" class="myButton"onclick="showStatusOptions(event)">update</button>'+ '</td><td>'+'<button data="' + 
        elm._id +'" class="myButton" onclick="deleteCommodity(event)">delete</button>'+'</td></tr>';
    });
    listCommodity += '</table>'
    // Inject the whole commodity list string into our existing #commodityList element
    document.querySelector('#commodityList').innerHTML=listCommodity; });
  }); 
};

// Add Commodity button click
document.querySelector('#btnAddcommodity').addEventListener('click', addCommodity);
// Add commodity
function addCommodity(event) {
    event.preventDefault();
    //validation - increase errorCount if any field is blank
    var errorCount = 0;
    document.querySelectorAll('#addcommodity input').forEach((elm) => {
        if (elm.value === '') { errorCount++; } });
            document.querySelectorAll('#addCommodity select').forEach((elm) => { if (elm.value === '') { errorCount++; }
    });
      // Check and make sure errorCount's still at zero
    if (errorCount === 0) {
    // If it is, compile all commodity information into one object
        var category = document.querySelector('select#inputCategory').value;
        var name = document.querySelector('input#inputName').value;
        var status = document.querySelector('select#inputStatus').value; var newCommodity = {
            'category': category,
            'name': name,
            'status': status
        }
        fetch('/users/addcommodity', {method: 'POST', body: JSON.stringify(newCommodity), headers: {'Content-Type': 'application/json'}})
            .then(response => {
            if (response.ok) {
                response.json().then(data => {
                if (data.msg === '') {
                    // Clear the form inputs
                    document.querySelector('input#inputName').value = ''; 
                    document.querySelector('select#inputCategory').value = 0; 
                    document.querySelector('select#inputStatus').value = 0; // Update the table
                    populateCommodityList();
                } else {
                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + data.msg);
                }
        });
    } else {
        alert("HTTP return status: "+response.status); }
    });
    } else {
    // If errorCount is more than 0, prompt to fill in all fields
        alert('Please fill in all fields');
        return false;
    }
};
function deleteCommodity(event) { 
    event.preventDefault();
    var id = event.target.getAttribute('data'); 
    fetch('/users/deletecommodity/'+id, {method: 'DELETE'})
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                if (data.msg === '') {
                    populateCommodityList();
                } else {
                    alert('Error: ' + data.msg);
                }
            });
        } else {
          alert("HTTP return status: "+response.status);
    } });
};
// Show Status Selection
function showStatusOptions(event) { 
    event.preventDefault();
    var id = event.target.getAttribute('data');
    var statusField='<select><option value="0">-- Status --</option>\ <option value="in stock">in stock</option>\<option value="out of stock">out of stock</option></select>\ <button data="' + 
    id + '" class="myButton"onclick="updateCommodity(event)">update</button>'; 
    document.querySelector("#status_"+id).innerHTML=statusField;
};
// Update commodity
function updateCommodity(event) { event.preventDefault();
    var id = event.target.getAttribute('data');
    var newStatus = document.querySelector("#status_"+id + " select").value;
      if (newStatus === '0'){
           alert('Please select status');
           return false;
      } else {
        var changeStatus = {
          'status': newStatus
        }
        fetch('/users/updatecommodity/'+id, {method: 'PUT', body: JSON.stringify(changeStatus), headers: {'Content-Type': 'application/json'}})
        .then(response => {
          if (response.ok) {
            response.json().then(data =>{
                if (data.msg === '') {
                    populateCommodityList();
                } else {
                    alert('Error: ' + data.msg);
                }
    });
    } else {
        alert("HTTP return status: "+response.status); }
    }); }
    };