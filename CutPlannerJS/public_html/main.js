function CutPlannerApp(){    
    
    // UI properties
    this.maxDayHeight = 500;
    this.maxDailyWorkUnits = 1270;   
    this.rows = [];
    
    this.buttonAddNew = null;
};

CutPlannerApp.prototype.addCell = function(element){
    var cell = this.addElement('td', '', 'table-cell');
    cell.appendChild(element);
    
    return cell;
};

CutPlannerApp.prototype.addDiv = function(class_name, text){
    var div = document.createElement('div');
    div.setAttribute('class', class_name);   
    div.innerHTML = (typeof text === "undefined" ? '' : text);
    
    return div;
};

CutPlannerApp.prototype.addElement = function(tag_name, text, class_name){
    var element = document.createElement(tag_name);
    element.className = typeof class_name !== "undefined" ? class_name :  '';
    element.innerHTML = text;    
    
    return element;
};

CutPlannerApp.prototype.addInput = function(type, class_name){
    var element = document.createElement('input');
    element.setAttribute('type', type);
    element.className = typeof class_name !== "undefined" ? class_name :  '';
    
    return element;
};

CutPlannerApp.prototype.totalManusForDay = function(groups){
    var totalmanus = 0;
    for(var i = 0; i < groups.length; i++)
    {
        totalmanus += groups[i].manus;
    }
    
    return totalmanus;
};

CutPlannerApp.prototype.datesEqual = function(date1, date2){
    date1 = date1.getDate() + '/' + date1.getMonth() + '/' + date1.getYear();
    date2 = date2.getDate() + '/' + date2.getMonth() + '/' + date2.getYear();
    
    return date1 === date2;
};

CutPlannerApp.prototype.formatDate = function(dateString){
  let date = new Date(dateString);  
  let today = new Date();
  let tomorrow = new Date();
  let yesterday = new Date();
  let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  let month = date.getMonth()+1 < 10 ? '0' + (date.getMonth() +1) : (date.getMonth() + 1);
  
  tomorrow.setDate(today.getDate()+1);
  yesterday.setDate(today.getDate()-1);
  
  if(this.datesEqual(date, today)) {
      return 'Today, ' + month + '/' + day;
  }
  
  if(this.datesEqual(date, tomorrow)) {
      return 'Tomorrow, ' + month + '/' + day;
  }
  
  if(this.datesEqual(date, yesterday)) {
      return 'Yesterday, ' + month + '/' + day;
  }
  
  return daysOfWeek[date.getDay()] + ', ' + month + '/' + day; 
};

CutPlannerApp.prototype.highlightOnChange = function(){
    if(this.value !== this.originalvalue){
        this.row.style.background = '#ffe160';
    }
    
    this.context.buttonAddNew.disabled = false;
};

CutPlannerApp.prototype.buttonToggle = function(buttons, value){
    for(let i = 0; i < buttons.length; i++){
        buttons[i].disabled = value;
    }
};

CutPlannerApp.prototype.refreshAll = function(context){
    // Refreshes the grid
    context.gridDiv.removeChild(context.gridDiv.firstChild);
    context.buildBucketGrid(context.gridDiv, context.loadJson());  

    // Refresh the list view
    context.listDiv.removeChild(context.listDiv.firstChild);
    context.buildGroupList(context.listDiv, context.loadJson());
};

CutPlannerApp.prototype.buildPlanSelector = function(rootElement){
    let dropDownMenuIdentifier = 'dropdownMenuButton_' + Math.floor((Math.random() * 10000000000) + 1);
    let dropDownMenuText = 'Select a draft plan';
    let dropDownPlanSelector = this.addDiv('dropdown');
    let dropDownPlanSelectorButton = this.addElement('button', dropDownMenuText, 'btn btn-secondary dropdown-toggle');
    let dropDownPlanSelectorOptions = this.addDiv('dropdown-menu');
    let buttonPlanUpdate = this.addInput('button', 'btn btn-warning float-right');
    let buttonAddNew = this.addInput('button', 'btn btn-success');
    let buttonRemove = this.addInput('button', 'btn btn-danger');
    //let buttonTest = this.addInput('button', 'btn btn-warning');
    let msgPlanWorkingOn = this.addElement('span', '', 'msg-current-plan');
    
    msgPlanWorkingOn.innerHTML = 'Working on a new plan...';    
    dropDownPlanSelectorButton.id = dropDownMenuIdentifier;
    dropDownPlanSelectorButton.setAttribute('data-toggle', 'dropdown');
    dropDownPlanSelectorButton.setAttribute('aria-haspopup', 'true');
    dropDownPlanSelectorButton.setAttribute('aria-expanded', 'false');
    dropDownPlanSelectorButton.setAttribute('type', 'button');    
    dropDownPlanSelectorButton.style.width = '180px';
    dropDownPlanSelectorOptions.setAttribute('aria-labelledby', dropDownMenuIdentifier);    
    dropDownPlanSelector.title = 'Select a plan in progress.';
    dropDownPlanSelector.appendChild(dropDownPlanSelectorButton);
    dropDownPlanSelector.appendChild(dropDownPlanSelectorOptions);
    
    // TODO: Loop through draft plans -- faking for now.
    for(let i = 0; i < 10; i++){
        let option = this.addElement('a', 'Plan #' + (i+1), 'dropdown-item');
        option.context = this;        
        option.onclick = function(){
            console.log('You\'ve selected option: ' + option.innerHTML);
            msgPlanWorkingOn.innerHTML = 'Now editing plan #' + (i+1) + '...';
            dropDownPlanSelectorButton.innerHTML = this.innerHTML;

            // Toggle buttons
            this.context.buttonToggle([buttonAddNew, buttonRemove, buttonPlanUpdate], false);

            // Refreshes the grid            
            this.context.refreshAll(this.context);
        };
        
        dropDownPlanSelectorOptions.appendChild(option);
    }
        
    this.buttonAddNew = buttonAddNew;
    buttonAddNew.value = 'New';
    buttonAddNew.title = 'Add a new plan.';
    buttonAddNew.disabled = true;
    buttonAddNew.context = this;
    buttonAddNew.onclick = function(){
        console.log('Creating a new plan.');
        msgPlanWorkingOn.innerHTML = 'Working on a new plan...';
        dropDownPlanSelectorButton.innerHTML = dropDownMenuText;

        // Toggle the buttons
        this.context.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], true);
        
        // Refreshes the grid            
        this.context.refreshAll(this.context);
    };
    
    buttonRemove.value = "Delete";
    buttonRemove.title = 'Remove a draft plan.';
    buttonRemove.disabled = true;
    buttonRemove.context = this;
    buttonRemove.onclick = function(){
        if(confirm('Are you sure you want to remove this draft plan?')){
            for(var i = 0; i < dropDownPlanSelectorOptions.childNodes.length; i++){
                if(dropDownPlanSelectorOptions.childNodes[i].innerHTML === dropDownPlanSelectorButton.innerHTML){
                    dropDownPlanSelectorOptions.removeChild(dropDownPlanSelectorOptions.childNodes[i]);
                    
                    // Refresh menu
                    dropDownPlanSelectorButton.innerHTML = dropDownMenuText;
                    msgPlanWorkingOn.innerHTML = 'Working on a new plan...';

                    // Toggle the buttons
                    this.context.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], true);
                    
                    // Refreshes the grid            
                    this.context.refreshAll(this.context);
                }
            }                        
        }
    };
        
    
    buttonPlanUpdate.value = 'Set as Current Plan';
    buttonPlanUpdate.title = 'Set this plan as the current factory plan.';
    buttonPlanUpdate.context = this;
    buttonPlanUpdate.disabled = true;
    buttonPlanUpdate.addEventListener('click', function(){
        if(confirm('Are you sure you want to replace the current plan with this one?')){
            // TODO: Send JSON changes to server
            console.log('Grid should be refreshed here.');

            // Refreshes the grid            
            this.context.refreshAll(this.context);      
        }
    });

    this.buttonSaveListView = this.addInput('button', 'btn btn-primary float-right');        
    this.buttonSaveListView.value = 'Save Changes'; 
    this.buttonSaveListView.context = this;
    this.buttonSaveListView.onclick = function(){
        // 1. Send JSON (from list). 
        // 2. Clear orange boxes.
        for(let i = 0; i < this.context.rows.length; i++){
            this.context.rows[i].row.style = '#fff';
            
            console.log(this.context.rows[i].inputName.value);
        }
        
        // 3. Enable button set as current plan.
        // 4. Enable button delete
        // 5. Enable button new
        // Toggle the buttons
        this.context.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], false);
        
        // 6. Refresh draft list and select current
        this.context.refreshAll(this.context);        
    };
    
    //buttonTest.value = 'A Test Button';
    //buttonTest.title = 'A test button';
    //buttonTest.onclick = function(){
     //   alert(RBT.get_simple_return());
    //};
    
    rootElement.appendChild(dropDownPlanSelector);
    rootElement.appendChild(buttonAddNew);
    rootElement.appendChild(buttonRemove);
    //rootElement.appendChild(buttonTest);
    rootElement.appendChild(msgPlanWorkingOn);
    rootElement.appendChild(this.buttonSaveListView);
    rootElement.appendChild(buttonPlanUpdate);
    
};

CutPlannerApp.prototype.buildBucketGrid = function(rootElement, data){
    // Build grid
    for(let planCounter = 0; planCounter < data.length; planCounter++)
    {
        let currentPlanDiv = this.addDiv('plan-container');       
        rootElement.appendChild(currentPlanDiv);
        
        // Loop days
        for(let dayCounter = 0; dayCounter < data[planCounter].when_planned.length; dayCounter++)
        {
            let currentDayDiv = this.addDiv('day-plan');
            currentDayDiv.manuPosition = 0;
            currentDayDiv.style.height = this.maxDayHeight + 'px';
            currentDayDiv.appendChild(this.addElement('div', this.formatDate(data[planCounter].when_planned[dayCounter].when_to_do.when_planned_done), 'day-title'));
            currentPlanDiv.appendChild(currentDayDiv);
            
            // Loop groups
            this.totalManusByCurrentDay = this.totalManusForDay(data[planCounter].when_planned[dayCounter].groups);
            for(let groupCounter = 0; groupCounter < data[planCounter].when_planned[dayCounter].groups.length; groupCounter++)
            {
                let group = data[planCounter].when_planned[dayCounter].groups[groupCounter];
                let currentGroupDiv = this.addDiv('group-day-plan');
                currentGroupDiv.style.height = Math.round(100 * (group.work_units / (this.maxDailyWorkUnits + 150)), 0) + '%';
                currentGroupDiv.style.backgroundColor = data[planCounter].when_planned[dayCounter].when_to_do.when_planned_done <= group.earliest_due_date ? '#efefef' : '#f2dede';
                currentGroupDiv.style.borderColor = group.type_color;
                currentGroupDiv.setAttribute('title', group.types);
                currentGroupDiv.group = group;
                currentGroupDiv.manusInserted = 0;  
                
                // Loop manus
                for(let manuCounter = 0; manuCounter < this.totalManusByCurrentDay; manuCounter++)
                {
                    let span = this.addElement('span', '', 'manu-item');
                    
                    // Space hasn't been occupied yet.
                    if(currentDayDiv.manuPosition <= manuCounter && currentGroupDiv.manusInserted < currentGroupDiv.group.manus)
                    {
                        span.style.borderRightColor = '#0000aa';
                        currentDayDiv.manuPosition++;
                        currentGroupDiv.manusInserted++;
                    }
                    
                    currentGroupDiv.appendChild(span);
                }
                
                currentDayDiv.appendChild(currentGroupDiv);
            }            
        }
    }
};

CutPlannerApp.prototype.buildGroupList = function(rootElement, data){
    let groups = [];
    let table = this.addElement('table', '', 'table');
    let tableHead = this.addElement('thead', '', 'table-header-group');
    let tableHeadRow = this.addElement('tr', '', 'table-row');
    let tableBody = this.addElement('tbody', '', 'table-body');    
    
    tableHeadRow.appendChild(this.addElement('th', 'Group #'));
    tableHeadRow.appendChild(this.addElement('th', 'Plan #'));
    tableHeadRow.appendChild(this.addElement('th', 'Name'));
    tableHeadRow.appendChild(this.addElement('th', 'Color'));
    tableHeadRow.appendChild(this.addElement('th', 'David told customer date'));
    tableHeadRow.appendChild(this.addElement('th', 'Factory completed date'));
    tableHeadRow.appendChild(this.addElement('th', 'Date requested by'));    
    tableHead.appendChild(tableHeadRow);
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    
    for(let dayCounter = 0; dayCounter < data[0].when_planned.length; dayCounter++)
    {
        let day = data[0].when_planned[dayCounter];      
        for(let groupCounter = 0; groupCounter < day.groups.length; groupCounter++)
        {
            let group = day.groups[groupCounter];
            let tableRow = this.addElement('tr', '', 'table-row');
            let inputName = this.addInput('text', 'form-control input-name');                 
            let inputColor = this.addInput('color', 'input-color');                
            let inputDueDate = this.addInput('text', 'form-control input-date');
            let inputActualDate = this.addInput('text', 'form-control input-date');
            let inputRequestedDate = this.addInput('text', 'form-control input-date');
                        
            if(groups[group.groupnbr] === true)
            {
                continue;
            }
            
            groups[group.groupnbr] = true;            
            this.rows.push({ "inputName": inputName, "inputColor": inputColor, "inputDueDate": inputDueDate, "group": group, "row": tableRow });
            
            inputName.context = this;
            inputName.value = group.types;
            inputName.originalvalue = group.types;
            inputName.row = tableRow;
            inputName.onkeyup = this.highlightOnChange;
            inputName.placeholder = 'Name...';
            
            inputColor.context = this;
            inputColor.value = group.type_color;
            inputColor.originalvalue = group.type_color;
            inputColor.row = tableRow;
            inputColor.onchange = this.highlightOnChange;            
            
            inputDueDate.context = this;
            inputDueDate.value = group.earliest_due_date;
            inputDueDate.originalvalue = group.earliest_due_date;
            inputDueDate.row = tableRow;            
            inputDueDate.onkeyup = this.highlightOnChange;
            inputDueDate.style.backgroundColor = day.when_to_do.when_planned_done <= group.earliest_due_date ? '#ffffff' : '#f2dede';            
            inputDueDate.placeholder = 'Date...';
            
            inputActualDate.context = this;
            inputActualDate.value = '';
            inputActualDate.row = tableRow;
            inputActualDate.onkeyup = this.highlightOnChange;
            inputActualDate.placeholder = 'Date...';
            
            inputRequestedDate.context = this;
            inputRequestedDate.value = '';
            inputRequestedDate.row = tableRow;
            inputRequestedDate.onkeyup = this.highlightOnChange;
            inputRequestedDate.placeholder = 'Date...';
            
            tableRow.appendChild(this.addElement('td', group.groupnbr, 'table-cell'));
            tableRow.appendChild(this.addElement('td', data[0].plan.plannbr, 'table-cell'));
            tableRow.appendChild(this.addCell(inputName));
            tableRow.appendChild(this.addCell(inputColor));
            tableRow.appendChild(this.addCell(inputDueDate));
            tableRow.appendChild(this.addCell(inputActualDate));
            tableRow.appendChild(this.addCell(inputRequestedDate));
            tableBody.appendChild(tableRow);
        }
    }
        
    rootElement.appendChild(table);
};

CutPlannerApp.prototype.loadHtml = function(widget_element_id){        
    
    RBT.jsonServerURL = 'http://192.168.0.240:8880/';
    
    /* RBT.putGetJson('CutPlanner', {}, function(response){
        console.log(response);
    }, null);*/
    
    let data = this.loadJson();
    let section = document.createElement('section');
    
    // Build menu
    this.menuDiv = this.addDiv('menu-container');    
    this.buildPlanSelector(this.menuDiv);    
    section.appendChild(this.menuDiv);
    
    // Build grid
    this.gridDiv = this.addDiv('grid-container');    
    this.buildBucketGrid(this.gridDiv, data);    
    section.appendChild(this.gridDiv);
    
    // Build list view
    this.listDiv = this.addDiv('list-container');
    this.buildGroupList(this.listDiv, data);
    section.appendChild(this.listDiv);
    
    // Build list view
    //this.listDiv = this.addDiv('list-container');
    //this.buildDemandGroupList(this.listDiv, data);
    //section.appendChild(this.listDiv);
    
    // Generate widget
    document.getElementById(widget_element_id).appendChild(section);
};

CutPlannerApp.prototype.loadJson = function(){
    return [{
                "plan": {
                        "plannbr": "10",
                        "curr_plan_yn": "Y"
                },
                "when_planned": [{
                        "when_to_do": {
                                "when_planned_done": "2018-02-22"
                        },
                        "groups": [{
                                "groupnbr": 1,
                                "orders": 2,
                                "manus": 4,
                                "fabrics": 2,
                                "work_units": 118,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2019-12-06",
                                "types": "P-Scrubs",
                                "hours_rep": 0.78,
                                "type_color": "#bf5cd5"
                        }, {
                                "groupnbr": 2,
                                "orders": 2,
                                "manus": 5,
                                "fabrics": 2,
                                "work_units": 144,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2017-12-06",
                                "types": "Embroidery",
                                "hours_rep": 0.96,
                                "type_color": "#14afed"
                        }, {
                                "groupnbr": 3,
                                "orders": 4,
                                "manus": 10,
                                "fabrics": 6,
                                "work_units": 201,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-07",
                                "types": "P-Scrubs, P-Sleepwear",
                                "hours_rep": 1.34,
                                "type_color": "#ffff00"
                        }, {
                                "groupnbr": 4,
                                "orders": 4,
                                "manus": 7,
                                "fabrics": 1,
                                "work_units": 222,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2017-12-07",
                                "types": "Calhoun CC Nursing",
                                "hours_rep": 1.48,
                                "type_color": "#0081ab"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-02-23"
                        },
                        "groups": [{
                                "groupnbr": 4,
                                "orders": 7,
                                "manus": 25,
                                "fabrics": 1,
                                "work_units": 748,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-07",
                                "types": "Calhoun CC Nursing",
                                "hours_rep": 4.98,
                                "type_color": "#0081ab"
                        }, {
                                "groupnbr": 5,
                                "orders": 4,
                                "manus": 16,
                                "fabrics": 1,
                                "work_units": 488,
                                "pseudo": "N",
                                "closed": "Y",
                                "earliest_due_date": "2018-12-07",
                                "types": "Univ of North Alabama",
                                "hours_rep": 3.25,
                                "type_color": "#db9f11"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-02-26"
                        },
                        "groups": [{
                                "groupnbr": 5,
                                "orders": 17,
                                "manus": 42,
                                "fabrics": 2,
                                "work_units": 1213,
                                "pseudo": "N",
                                "closed": "Y",
                                "earliest_due_date": "2018-12-07",
                                "types": "Univ of North Alabama",
                                "hours_rep": 8.08,
                                "type_color": "#db9f11"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-02-27"
                        },
                        "groups": [{
                                "groupnbr": 5,
                                "orders": 18,
                                "manus": 18,
                                "fabrics": 1,
                                "work_units": 414,
                                "pseudo": "N",
                                "closed": "Y",
                                "earliest_due_date": "2017-12-07",
                                "types": "Univ of North Alabama",
                                "hours_rep": 2.76,
                                "type_color": "#db9f11"
                        }, {
                                "groupnbr": 6,
                                "orders": 8,
                                "manus": 24,
                                "fabrics": 10,
                                "work_units": 708,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-08",
                                "types": "P-Scrubs",
                                "hours_rep": 4.72,
                                "type_color": "#bf5cd5"
                        }, {
                                "groupnbr": 7,
                                "orders": 2,
                                "manus": 3,
                                "fabrics": 1,
                                "work_units": 98,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-08",
                                "types": "Olivet Nazarene University",
                                "hours_rep": 0.65,
                                "type_color": "#1a0dab"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-02-28"
                        },
                        "groups": [{
                                "groupnbr": 7,
                                "orders": 1,
                                "manus": 1,
                                "fabrics": 1,
                                "work_units": 22,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-08",
                                "types": "Olivet Nazarene University",
                                "hours_rep": 0.14,
                                "type_color": "#1a0dab"
                        }, {
                                "groupnbr": 8,
                                "orders": 6,
                                "manus": 21,
                                "fabrics": 2,
                                "work_units": 587,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-08",
                                "types": "Univ of North Alabama",
                                "hours_rep": 3.91,
                                "type_color": "#db9f11"
                        }, {
                                "groupnbr": 9,
                                "orders": 2,
                                "manus": 4,
                                "fabrics": 2,
                                "work_units": 108,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-11",
                                "types": "P-Scrubs",
                                "hours_rep": 0.72,
                                "type_color": "#bf5cd5"
                        }, {
                                "groupnbr": 10,
                                "orders": 1,
                                "manus": 4,
                                "fabrics": 2,
                                "work_units": 120,
                                "pseudo": "N",
                                "closed": "N",
                                "earliest_due_date": "2018-12-11",
                                "types": "Dixie State Univ Nursing",
                                "hours_rep": 0.80,
                                "type_color": "#ba1c21"
                        }, {
                                "groupnbr": 11,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-02-26",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-01"
                        },
                        "groups": [{
                                "groupnbr": 12,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-01",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-02"
                        },
                        "groups": [{
                                "groupnbr": 13,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-03",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-05"
                        },
                        "groups": [{
                                "groupnbr": 14,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-05",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-06"
                        },
                        "groups": [{
                                "groupnbr": 15,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-06",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-07"
                        },
                        "groups": [{
                                "groupnbr": 16,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-07",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-08"
                        },
                        "groups": [{
                                "groupnbr": 17,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-08",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-09"
                        },
                        "groups": [{
                                "groupnbr": 18,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-09",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-10"
                        },
                        "groups": [{
                                "groupnbr": 19,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-10",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-11"
                        },
                        "groups": [{
                                "groupnbr": 20,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-11",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-14"
                        },
                        "groups": [{
                                "groupnbr": 21,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-14",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-15"
                        },
                        "groups": [{
                                "groupnbr": 22,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-15",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-16"
                        },
                        "groups": [{
                                "groupnbr": 23,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-16",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-19"
                        },
                        "groups": [{
                                "groupnbr": 24,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-19",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-20"
                        },
                        "groups": [{
                                "groupnbr": 25,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-20",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-21"
                        },
                        "groups": [{
                                "groupnbr": 26,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-21",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-22"
                        },
                        "groups": [{
                                "groupnbr": 27,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-22",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-23"
                        },
                        "groups": [{
                                "groupnbr": 28,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-23",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-26"
                        },
                        "groups": [{
                                "groupnbr": 29,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-26",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-27"
                        },
                        "groups": [{
                                "groupnbr": 30,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-27",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-28"
                        },
                        "groups": [{
                                "groupnbr": 31,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-28",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }]
        }];
};
