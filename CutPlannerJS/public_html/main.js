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

CutPlannerApp.prototype.refreshAll = function(context, plannbr, action, values){
    context.loadJson(function(data){
        // Refreshes the menu
        context.menuDiv.removeChild(context.menuDiv.firstChild);
        context.buildPlanSelector(context.menuDiv, data, plannbr);
        
        // Refreshes the grid
        context.gridDiv.removeChild(context.gridDiv.firstChild);
        context.buildBucketGrid(context.gridDiv, data);  

        // Refresh the list view
        context.listDiv.removeChild(context.listDiv.firstChild);
        context.buildGroupList(context.listDiv, data);
    }, plannbr, action, values);
    
};
/*
CutPlannerApp.prototype.refreshMenu = function(context, plannbr, action){
    context.loadJson(function(data){
        // Refreshes the menu
        context.menuDiv.removeChild(context.menuDiv.firstChild);
        context.buildPlanSelector(context.menuDiv, data);
    }, plannbr, action);
};

CutPlannerApp.prototype.refreshBucketGrid = function(context, plannbr, action){
    context.loadJson(function(data){        
        // Refreshes the grid
        context.gridDiv.removeChild(context.gridDiv.firstChild);
        context.buildBucketGrid(context.gridDiv, data);  
    }, plannbr, action);
    
};

CutPlannerApp.prototype.refreshGroupList = function(context, plannbr, action){
    context.loadJson(function(data){        
        // Refresh the list view
        context.listDiv.removeChild(context.listDiv.firstChild);
        context.buildGroupList(context.listDiv, data);
    }, plannbr, action)  
};*/

CutPlannerApp.prototype.refreshBucketAndGroupList = function(context, plannbr, action, values) {
    context.loadJson(function(data){        
        // Refreshes the grid
        context.gridDiv.removeChild(context.gridDiv.firstChild);
        context.buildBucketGrid(context.gridDiv, data);  

        // Refresh the list view
        context.listDiv.removeChild(context.listDiv.firstChild);
        context.buildGroupList(context.listDiv, data);
    }, plannbr, action, values);
};


CutPlannerApp.prototype.buildPlanSelector = function(rootElement, data, plannbr){
    let menuContainer = this.addDiv('menu-container');
    let dropDownMenuIdentifier = 'dropdownMenuButton_' + Math.floor((Math.random() * 10000000000) + 1);
    let dropDownMenuText = 'Select a draft plan';
    let dropDownPlanSelector = this.addDiv('dropdown');
    let dropDownPlanSelectorButton = this.addElement('button', dropDownMenuText, 'btn btn-secondary dropdown-toggle');
    let dropDownPlanSelectorOptions = this.addDiv('dropdown-menu');
    let buttonPlanUpdate = this.addInput('button', 'btn btn-warning float-right');
    let buttonAddNew = this.addInput('button', 'btn btn-success');
    let buttonRemove = this.addInput('button', 'btn btn-danger');
    let msgPlanWorkingOn = this.addElement('span', '', 'msg-current-plan');
    let self = this;
    let selected = typeof plannbr !== "undefined" ? plannbr : 0;
    let selectedIsCurrent = false;
    
    rootElement.appendChild(menuContainer);
    
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
    
    for(let i = 0; i < data.plans.length; i++){
        let option = this.addElement('a', data.plans[i].plan_name + (data.plans[i].is_current_plan ? ' &#x2714;' : ''), 'dropdown-item');
        //option.context = this;        
        option.onclick = function(){
            
            // Set selected plan
            selected = data.plans[i].plannbr;
            selectedIsCurrent = data.plans[i].is_current_plan ? true : false;
            
            // Set message text
            msgPlanWorkingOn.innerHTML = 'Now editing: ' + data.plans[i].plan_name + (selectedIsCurrent ? ' (Current)' : '') + '...';
            dropDownPlanSelectorButton.innerHTML = this.innerHTML;

            // Toggle buttons
            self.buttonToggle([buttonRemove, buttonPlanUpdate], selectedIsCurrent);
            self.buttonToggle([buttonAddNew], false);

            // Refreshes the grid            
            self.refreshBucketAndGroupList(self, selected, 'json');
        };
        
        // If selected otherwise select current.
        if(selected === data.plans[i].plannbr || (selected === 0 && data.plans[i].is_current_plan)){
            option.click();
        }
        dropDownPlanSelectorOptions.appendChild(option);
    }
        
    this.buttonAddNew = buttonAddNew;
    buttonAddNew.value = 'New';
    buttonAddNew.title = 'Add a new plan.';
    buttonAddNew.disabled = true;
    buttonAddNew.onclick = function(){
        
        // Set message text
        msgPlanWorkingOn.innerHTML = 'Working on a new plan...';
        dropDownPlanSelectorButton.innerHTML = dropDownMenuText;

        // Toggle the buttons
        self.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], true);
        
        // Refreshes the grid            
        self.refreshAll(self, 0, 'new-plan');
    };
    
    buttonRemove.value = "Delete";
    buttonRemove.title = 'Remove a draft plan.';
    buttonRemove.disabled = true;
    buttonRemove.onclick = function(){
        if(confirm('Are you sure you want to remove this draft plan?')){
            for(var i = 0; i < dropDownPlanSelectorOptions.childNodes.length; i++){
                if(dropDownPlanSelectorOptions.childNodes[i].innerHTML === dropDownPlanSelectorButton.innerHTML){
                    dropDownPlanSelectorOptions.removeChild(dropDownPlanSelectorOptions.childNodes[i]);
                    
                    // Set message text
                    dropDownPlanSelectorButton.innerHTML = dropDownMenuText;
                    msgPlanWorkingOn.innerHTML = 'Working on a new plan...';

                    // Toggle the buttons
                    self.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], true);
                    
                    // Refreshes the grid            
                    self.refreshBucketAndGroupList(self, selected, 'remove-plan');
                }
            }                        
        }
    };
        
    buttonPlanUpdate.value = 'Set as Current Plan';
    buttonPlanUpdate.title = 'Set this plan as the current factory plan.';
    buttonPlanUpdate.disabled = true;
    buttonPlanUpdate.addEventListener('click', function(){
        if(confirm('Are you sure you want to replace the current plan with this one?')){
            // Refreshes the grid            
            self.refreshAll(self, selected, 'set-current'); 
            
            // Disable remove since we don't want to delete current plan.
            buttonRemove.disabled = true;
        }
    });

    this.buttonSaveListView = this.addInput('button', 'btn btn-primary float-right');        
    this.buttonSaveListView.value = 'Save Changes'; 
    this.buttonSaveListView.onclick = function(){
        // 1. Send JSON (from list). 
        // 2. Clear orange boxes.
        let changes = [];
        for(let i = 0; i < self.rows.length; i++){
            //self.rows[i].row.style = '#fff';
            if(self.rows[i].changed()){
                changes.push(self.rows[i].getJson());
                console.log(self.rows[i].getJson());
            }
        }
        
        // 3. Enable button set as current plan.
        // 4. Enable button delete
        // 5. Enable button new
        // Toggle the buttons
        self.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], false);
        
        // 6. Refresh draft list and select current
        self.refreshBucketAndGroupList(self, selected, 'save-plan', changes);        
    };
    
    menuContainer.appendChild(dropDownPlanSelector);
    menuContainer.appendChild(buttonAddNew);
    menuContainer.appendChild(buttonRemove);
    menuContainer.appendChild(msgPlanWorkingOn);
    menuContainer.appendChild(this.buttonSaveListView);
    menuContainer.appendChild(buttonPlanUpdate); 
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
                    //console.log(group.manu_detail[index].fabric_color);
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
    this.rows = [];
    
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
        this.rows.push({ 
            "inputName": inputName, 
            "inputColor": inputColor, 
            "inputDueDate": inputDueDate, 
            "group": group, 
            "row": tableRow,
            "changed" : function(){
                return (this.inputName.value !== this.group.type 
                    || this.inputColor.value !== this.group.color 
                    || this.inputDueDate.value !== this.group.earliest_due_date);
            },
            getJson: function(){
                return { name : this.inputName.value, color: this.inputColor.value, date: this.inputDueDate.value };
            }
        });

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
    var self = this;
    
    if(RBT !== null){
        RBT.jsonServerURL = 'http://ds3.coldlogic.com:24089/';
    }
    
    this.loadJson(function(data){
        let section = document.createElement('section');

        // Build menu
        self.menuDiv = self.addDiv('menu-container');    
        self.buildPlanSelector(self.menuDiv, data);    
        section.appendChild(self.menuDiv);

        // Build grid
        self.gridDiv = self.addDiv('grid-container');    
        self.buildBucketGrid(self.gridDiv, data);    
        section.appendChild(self.gridDiv);

        // Build list view
        self.listDiv = self.addDiv('list-container');
        self.buildGroupList(self.listDiv, data);
        section.appendChild(self.listDiv);
        
        // Generate widget
        document.getElementById(widget_element_id).appendChild(section);
    }, 0, 'json');
};

CutPlannerApp.prototype.loadJson = function(callback, plannbr, action, rows){
    let post = { 
        "id": "rbt_widget_CutPlanner", 
        "action": action, 
        "value": plannbr, 
        "values": (typeof rows !== "undefined" ? rows : []) 
    };
    console.log(post);
    RBT.putGetJson('cutplanner', JSON.stringify(post), callback, null);
};