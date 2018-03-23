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
  let day = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate()+1;
  let month = date.getMonth()+1 < 10 ? '0' + (date.getMonth() +1) : (date.getMonth() + 1);
  
  tomorrow.setDate(today.getDate()+1);
  yesterday.setDate(today.getDate()-1);
  
  //console.log('Date: ' + date + ' Today: ' + today + ' Tomorrow: ' + tomorrow + ' Yesterday: ' + yesterday);
  
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

CutPlannerApp.prototype.buildPlanSelector = function(rootElement, data){
    
    //console.log(data.error);
    
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
    for(let i = 0; i < data.plans.length; i++){
        let option = this.addElement('a', data.plans[i].plan_name, 'dropdown-item');
        option.context = this;        
        option.onclick = function(){
            console.log('You\'ve selected option: ' + data.plans[i].plan_name);
            msgPlanWorkingOn.innerHTML = 'Now editing: ' + data.plans[i].plan_name + '...';
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

    let currentPlanDiv = this.addDiv('plan-container');       
    rootElement.appendChild(currentPlanDiv);

    // Loop days
    for(let dayCounter = 0; dayCounter < data.days.length; dayCounter++)
    {
        let currentDayDiv = this.addDiv('day-plan');
        let dayHeaderDiv = this.addElement('div', this.formatDate(data.days[dayCounter].day), 'day-title');
        dayHeaderDiv.title = data.days[dayCounter].day;
        currentDayDiv.manuPosition = 0;
        currentDayDiv.style.height = this.maxDayHeight + 'px';
        currentDayDiv.appendChild(dayHeaderDiv);
        currentPlanDiv.appendChild(currentDayDiv);

        // Loop groups
        this.totalManusByCurrentDay = this.totalManusForDay(data.days[dayCounter].buckets);
        for(let groupCounter = 0; groupCounter < data.days[dayCounter].buckets.length; groupCounter++)
        {
            let group = data.days[dayCounter].buckets[groupCounter];
            let currentGroupDiv = this.addDiv('group-day-plan');
            currentGroupDiv.style.height = Math.round(100 * (group.work_units / (this.maxDailyWorkUnits + 150)), 0) + '%';
            currentGroupDiv.style.backgroundColor = data.days[dayCounter].day <= group.due_date ? '#efefef' : '#f2dede';
            currentGroupDiv.style.borderColor = group.color;
            currentGroupDiv.setAttribute('title', group.type);
            currentGroupDiv.group = group;
            currentGroupDiv.manusInserted = 0;  
            let index = 0;
            // Loop manus
            for(let manuCounter = 0; manuCounter < this.totalManusByCurrentDay; manuCounter++)
            {
                let span = this.addElement('span', '', 'manu-item');

                // Space hasn't been occupied yet.
                if(currentDayDiv.manuPosition <= manuCounter && currentGroupDiv.manusInserted < currentGroupDiv.group.manus)
                {
                    console.log(group.manu_detail[index].fabric_color);
                    span.style.borderRightColor = group.manu_detail[index].fabric_color;
                    currentDayDiv.manuPosition++;
                    currentGroupDiv.manusInserted++;
                    index++;
                }

                currentGroupDiv.appendChild(span);
            }

            currentDayDiv.appendChild(currentGroupDiv);
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
    tableHeadRow.appendChild(this.addElement('th', 'Customer promised date'));
    tableHeadRow.appendChild(this.addElement('th', 'Factory completed date'));
    tableHeadRow.appendChild(this.addElement('th', 'Date requested by'));    
    tableHead.appendChild(tableHeadRow);
    table.appendChild(tableHead);
    table.appendChild(tableBody);
    
    //let day = data[0].when_planned[dayCounter];   
    
    for(let groupCounter = 0; groupCounter < data.groups.length; groupCounter++)
    {
        let group = data.groups[groupCounter];
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
        inputName.value = group.type;
        inputName.originalvalue = group.type;
        inputName.row = tableRow;
        inputName.onkeyup = this.highlightOnChange;
        inputName.placeholder = 'Name...';

        inputColor.context = this;
        inputColor.value = group.color;
        inputColor.originalvalue = group.color;
        inputColor.row = tableRow;
        inputColor.onchange = this.highlightOnChange;            

        inputDueDate.context = this;
        inputDueDate.value = group.earliest_due_date;
        inputDueDate.originalvalue = group.earliest_due_date;
        inputDueDate.row = tableRow;            
        inputDueDate.onkeyup = this.highlightOnChange;
        inputDueDate.style.backgroundColor = group.due_date <= group.earliest_due_date ? '#ffffff' : '#f2dede';            
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
        tableRow.appendChild(this.addElement('td', group.plannbr, 'table-cell'));
        tableRow.appendChild(this.addCell(inputName));
        tableRow.appendChild(this.addCell(inputColor));
        tableRow.appendChild(this.addCell(inputDueDate));
        tableRow.appendChild(this.addCell(inputActualDate));
        tableRow.appendChild(this.addCell(inputRequestedDate));
        tableBody.appendChild(tableRow);
    }
        
    rootElement.appendChild(table);
};

CutPlannerApp.prototype.loadHtml = function(widget_element_id){        
    
    if(RBT !== null){
        RBT.jsonServerURL = 'http://192.168.0.240:8880/';
    }
    
    /* RBT.putGetJson('CutPlanner', {}, function(response){
        console.log(response);
    }, null);*/
    
    let section = document.createElement('section');
    let data = this.loadJson();
    if(typeof data === "undefined"){
        console.log('Unable to retrieve data from server. Exiting application...');
        return;
    }
    
    // Build menu
    this.menuDiv = this.addDiv('menu-container');    
    this.buildPlanSelector(this.menuDiv, data);    
    section.appendChild(this.menuDiv);
    
    // Build grid
    this.gridDiv = this.addDiv('grid-container');    
    this.buildBucketGrid(this.gridDiv, data);    
    section.appendChild(this.gridDiv);
    
    // Build list view
    this.listDiv = this.addDiv('list-container');
    this.buildGroupList(this.listDiv, data);
    section.appendChild(this.listDiv);
    
    // Generate widget
    document.getElementById(widget_element_id).appendChild(section);
};

CutPlannerApp.prototype.loadJson = function(){
    try {
        RBT.putGetJson('widget_cutplanner', { action: 'json', value: 0}, function(result){
            console.log(JSON.parse(result));
            return JSON.parse(result);
        }, null);
    }
    catch(exception){
        console.log(exception.message);
    }
    
    return null;
    /*
    return {
        "success":true,
        "message":"Hello World!",
        "groups":[
           {
              "type":"Pseudo Manu",
              "color":"#095334",
              "plannbr":2,
              "due_date":"2017-03-30",
              "groupnbr":1,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2017-03-30",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#292929",
              "plannbr":2,
              "due_date":"2017-03-31",
              "groupnbr":2,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2017-03-31",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#002594",
              "plannbr":2,
              "due_date":"2017-03-31",
              "groupnbr":3,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2017-03-31",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Helene Fuld College",
              "color":"#272c4f",
              "plannbr":2,
              "due_date":"2017-03-31",
              "groupnbr":4,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2017-03-31",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Univ of West Alabama",
              "color":"#c42020",
              "plannbr":2,
              "due_date":"2017-03-31",
              "groupnbr":5,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2017-03-31",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-16",
              "groupnbr":6,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-16",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-19",
              "groupnbr":7,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-19",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-20",
              "groupnbr":8,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-20",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-21",
              "groupnbr":9,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-21",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-22",
              "groupnbr":10,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-22",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-23",
              "groupnbr":11,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-23",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-26",
              "groupnbr":12,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-26",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-27",
              "groupnbr":13,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-27",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-28",
              "groupnbr":14,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-28",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-29",
              "groupnbr":15,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-29",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-03-30",
              "groupnbr":16,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-03-30",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-02",
              "groupnbr":17,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-02",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-03",
              "groupnbr":18,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-03",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-04",
              "groupnbr":19,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-04",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-05",
              "groupnbr":20,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-05",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-06",
              "groupnbr":21,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-06",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-09",
              "groupnbr":22,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-09",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-10",
              "groupnbr":23,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-10",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-11",
              "groupnbr":24,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-11",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-12",
              "groupnbr":25,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-12",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-13",
              "groupnbr":26,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-13",
              "date_can_be_completed":null,
              "date_promised_customer":null
           },
           {
              "type":"Pseudo Manu",
              "color":"#000000",
              "plannbr":2,
              "due_date":"2018-04-17",
              "groupnbr":27,
              "date_cut_by":null,
              "date_completed":null,
              "earliest_due_date":"2018-04-17",
              "date_can_be_completed":null,
              "date_promised_customer":null
           }
        ],
        "days":[
           {
              "day":"2018-03-12",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"#095334",
                    "manus":2,
                    "closed":"N",
                    "orders":1,
                    "pseudo":"N",
                    "fabrics":1,
                    "plannbr":2,
                    "due_date":"2017-03-30",
                    "groupnbr":1,
                    "done_date":"2018-03-12",
                    "line_type":"Solid",
                    "work_units":61,
                    "manu_detail":[
                       {
                          "manunbr":59248,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":1,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59250,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":2,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59251,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":5,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59252,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":6,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59253,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":3,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59254,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":7,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59255,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":4,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59256,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":8,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59257,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":17,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59258,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":18,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59259,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":13,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59260,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":15,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59261,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":14,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59262,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":16,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59263,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":19,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59264,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":20,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59265,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":9,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59266,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":10,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59267,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":11,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59268,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":12,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 },
                 {
                    "type":"Pseudo Manu",
                    "color":"#292929",
                    "manus":10,
                    "closed":"N",
                    "orders":4,
                    "pseudo":"N",
                    "fabrics":4,
                    "plannbr":2,
                    "due_date":"2017-03-31",
                    "groupnbr":2,
                    "done_date":"2018-03-12",
                    "line_type":"Mixed",
                    "work_units":279,
                    "manu_detail":[
                       {
                          "manunbr":59248,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":1,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59250,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":2,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59251,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":5,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59252,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":6,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59253,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":3,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59254,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":7,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59255,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":4,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59256,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":8,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59257,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":17,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59258,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":18,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59259,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":13,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59260,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":15,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59261,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":14,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59262,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":16,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59263,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":19,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59264,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":20,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59265,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":9,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59266,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":10,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59267,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":11,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59268,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":12,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 },
                 {
                    "type":"Pseudo Manu",
                    "color":"#002594",
                    "manus":4,
                    "closed":"N",
                    "orders":1,
                    "pseudo":"N",
                    "fabrics":2,
                    "plannbr":2,
                    "due_date":"2017-03-31",
                    "groupnbr":3,
                    "done_date":"2018-03-12",
                    "line_type":"Mixed",
                    "work_units":122,
                    "manu_detail":[
                       {
                          "manunbr":59248,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":1,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59250,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":2,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59251,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":5,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59252,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":6,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59253,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":3,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59254,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":7,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59255,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":4,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59256,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":8,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59257,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":17,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59258,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":18,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59259,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":13,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59260,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":15,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59261,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":14,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59262,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":16,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59263,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":19,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59264,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":20,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59265,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":9,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59266,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":10,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59267,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":11,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59268,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":12,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 },
                 {
                    "type":"Helene Fuld College",
                    "color":"#272c4f",
                    "manus":2,
                    "closed":"N",
                    "orders":1,
                    "pseudo":"N",
                    "fabrics":1,
                    "plannbr":2,
                    "due_date":"2017-03-31",
                    "groupnbr":4,
                    "done_date":"2018-03-12",
                    "line_type":"Solid",
                    "work_units":59,
                    "manu_detail":[
                       {
                          "manunbr":59248,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":1,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59250,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":2,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59251,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":5,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59252,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":6,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59253,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":3,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59254,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":7,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59255,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":4,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59256,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":8,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59257,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":17,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59258,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":18,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59259,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":13,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59260,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":15,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59261,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":14,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59262,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":16,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59263,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":19,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59264,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":20,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59265,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":9,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59266,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":10,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59267,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":11,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59268,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":12,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 },
                 {
                    "type":"Univ of West Alabama",
                    "color":"#c42020",
                    "manus":2,
                    "closed":"N",
                    "orders":1,
                    "pseudo":"N",
                    "fabrics":1,
                    "plannbr":2,
                    "due_date":"2017-03-31",
                    "groupnbr":5,
                    "done_date":"2018-03-12",
                    "line_type":"Solid",
                    "work_units":44,
                    "manu_detail":[
                       {
                          "manunbr":59248,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":1,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59250,
                          "fabric_color":"#002594",
                          "fabrictypenbr":174,
                          "manu_sequence":2,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59251,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":5,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59252,
                          "fabric_color":"#002594",
                          "fabrictypenbr":80,
                          "manu_sequence":6,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59253,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":3,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59254,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":7,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59255,
                          "fabric_color":"#002594",
                          "fabrictypenbr":75,
                          "manu_sequence":4,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59256,
                          "fabric_color":"#002594",
                          "fabrictypenbr":84,
                          "manu_sequence":8,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59257,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":17,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59258,
                          "fabric_color":"#002594",
                          "fabrictypenbr":82,
                          "manu_sequence":18,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59259,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":13,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59260,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":15,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59261,
                          "fabric_color":"#002594",
                          "fabrictypenbr":76,
                          "manu_sequence":14,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59262,
                          "fabric_color":"#002594",
                          "fabrictypenbr":90,
                          "manu_sequence":16,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59263,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":19,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59264,
                          "fabric_color":"#002594",
                          "fabrictypenbr":86,
                          "manu_sequence":20,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59265,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":9,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59266,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":10,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59267,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":11,
                          "fabric_line_type":"dotted"
                       },
                       {
                          "manunbr":59268,
                          "fabric_color":"#002594",
                          "fabrictypenbr":92,
                          "manu_sequence":12,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-16",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-16",
                    "groupnbr":6,
                    "done_date":"2018-03-16",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59501,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":21,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-19",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-19",
                    "groupnbr":7,
                    "done_date":"2018-03-19",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59504,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":22,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-20",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-20",
                    "groupnbr":8,
                    "done_date":"2018-03-20",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59502,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":23,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-21",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-21",
                    "groupnbr":9,
                    "done_date":"2018-03-21",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59503,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":24,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-22",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-22",
                    "groupnbr":10,
                    "done_date":"2018-03-22",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59505,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":25,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-23",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-23",
                    "groupnbr":11,
                    "done_date":"2018-03-23",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59506,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":26,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-26",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-26",
                    "groupnbr":12,
                    "done_date":"2018-03-26",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59509,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":27,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-27",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-27",
                    "groupnbr":13,
                    "done_date":"2018-03-27",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59507,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":28,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-28",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-28",
                    "groupnbr":14,
                    "done_date":"2018-03-28",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59508,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":29,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-29",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-29",
                    "groupnbr":15,
                    "done_date":"2018-03-29",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59510,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":30,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-03-30",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-03-30",
                    "groupnbr":16,
                    "done_date":"2018-03-30",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59511,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":31,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-02",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-02",
                    "groupnbr":17,
                    "done_date":"2018-04-02",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59514,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":32,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-03",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-03",
                    "groupnbr":18,
                    "done_date":"2018-04-03",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59512,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":33,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-04",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-04",
                    "groupnbr":19,
                    "done_date":"2018-04-04",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59513,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":34,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-05",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-05",
                    "groupnbr":20,
                    "done_date":"2018-04-05",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59515,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":35,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-06",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-06",
                    "groupnbr":21,
                    "done_date":"2018-04-06",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59516,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":36,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-09",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-09",
                    "groupnbr":22,
                    "done_date":"2018-04-09",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59519,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":37,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-10",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-10",
                    "groupnbr":23,
                    "done_date":"2018-04-10",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59517,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":38,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-11",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-11",
                    "groupnbr":24,
                    "done_date":"2018-04-11",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59518,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":39,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-12",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-12",
                    "groupnbr":25,
                    "done_date":"2018-04-12",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59520,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":40,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-13",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-13",
                    "groupnbr":26,
                    "done_date":"2018-04-13",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59521,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":41,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           },
           {
              "day":"2018-04-17",
              "buckets":[
                 {
                    "type":"Pseudo Manu",
                    "color":"None",
                    "manus":1,
                    "closed":"N",
                    "orders":0,
                    "pseudo":"Y",
                    "fabrics":0,
                    "plannbr":2,
                    "due_date":"2018-04-17",
                    "groupnbr":27,
                    "done_date":"2018-04-17",
                    "line_type":"None",
                    "work_units":240,
                    "manu_detail":[
                       {
                          "manunbr":59522,
                          "fabric_color":"#002594",
                          "fabrictypenbr":null,
                          "manu_sequence":42,
                          "fabric_line_type":"dotted"
                       }
                    ],
                    "current_plan":"Y"
                 }
              ]
           }
        ],
        "plans":[
           {
              "plannbr":2,
              "plan_name":"Initial Curr Plan",
              "last_updated":"2018-03-12 09:31:04.000000",
              "is_current_plan":1,
              "last_modified_by":""
           },
           {
              "plannbr":3,
              "plan_name":"Test plan#1",
              "last_updated":"2018-03-21 11:11:12.000000",
              "is_current_plan":0,
              "last_modified_by":""
           },
           {
              "plannbr":4,
              "plan_name":"Test plan#2",
              "last_updated":"2018-03-21 11:11:53.000000",
              "is_current_plan":0,
              "last_modified_by":""
           },
           {
              "plannbr":5,
              "plan_name":"Test plan#3",
              "last_updated":"2018-03-21 11:12:02.000000",
              "is_current_plan":0,
              "last_modified_by":""
           },
           {
              "plannbr":6,
              "plan_name":"Test plan#4",
              "last_updated":"2018-03-21 11:12:08.000000",
              "is_current_plan":0,
              "last_modified_by":""
           },
           {
              "plannbr":7,
              "plan_name":"Test plan#5",
              "last_updated":"2018-03-21 11:12:13.000000",
              "is_current_plan":0,
              "last_modified_by":""
           }
        ],
        "user":{
           "name":"Unknown"
        }
     };*/
};
