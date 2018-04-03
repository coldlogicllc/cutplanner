function CutPlannerApp(){    
    
    // UI properties
    this.maxDayHeight = 500;
    this.maxDailyWorkUnits = 1270;   
    this.rows = [];
    this.groups = [];
    
    this.buttonAddNew = null;
};

CutPlannerApp.prototype.addCell = function(element){
    var cell = this.addElement('td', '', 'table-cell');
    cell.appendChild(element);
    
    return cell;
};

CutPlannerApp.prototype.addCellArray = function(elements){
    var cell = this.addElement('td', '', 'table-cell');
    for(let i = 0; i < elements.length; i++){
        cell.appendChild(elements[i]);
    }
        
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
        totalmanus += groups[i].n;
    }
    
    return totalmanus;
};

CutPlannerApp.prototype.datesEqual = function(date1, date2){
    date1 = date1.getDate() + '/' + date1.getMonth() + '/' + date1.getFullYear();
    date2 = date2.getDate() + '/' + (1+date2.getMonth()) + '/' + date2.getFullYear();    
    
    return date1 === date2;
};

CutPlannerApp.prototype.getDateFromString = function(str){
   let parts = str.split('-');    
   
   return new Date(parts[0], parts[1], parts[2]);
};

CutPlannerApp.prototype.formatDate = function(dateString){
  let date = this.getDateFromString(dateString);
  let today = new Date();
  let tomorrow = new Date();
  let yesterday = new Date();
  let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let day = date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate();
  let month = date.getMonth()+1 < 10 ? '0' + (date.getMonth()) : (date.getMonth());
  
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

CutPlannerApp.prototype.isCurrentPlan = function(data, plan){
    return data.current_plannbr === plan.plannbr;
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
        
        context.loadingDiv.style.display = 'none';
    }, plannbr, action, values);
};

CutPlannerApp.prototype.refreshBucketAndGroupList = function(context, plannbr, action, values) {
    context.loadJson(function(data){        
        // Refreshes the grid
        context.gridDiv.removeChild(context.gridDiv.firstChild);
        context.buildBucketGrid(context.gridDiv, data);  

        // Refresh the list view
        context.listDiv.removeChild(context.listDiv.firstChild);
        context.buildGroupList(context.listDiv, data);
        
        context.loadingDiv.style.display = 'none';
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
            selectedIsCurrent = self.isCurrentPlan(data, data.plans[i]);
            
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

        let changes = [];
        for(let i = 0; i < self.rows.length; i++){
            //self.rows[i].row.style = '#fff';
            if(self.rows[i].changed()){
                changes.push(self.rows[i].getJson());
                //console.log(self.rows[i].getJson());
            }
        }

        // Toggle buttons
        self.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], false);
        
        // Refresh draft list and select current
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
    
    this.groups = [];
    for(let groupCounter = 0; groupCounter < data.groups.length; groupCounter++)
    {
        this.groups[data.groups[groupCounter].order_groupnbr] = data.groups[groupCounter];
    }

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
        this.totalManusByCurrentDay = this.totalManusForDay(data.days[dayCounter].plan);
        //console.log(this.totalManusByCurrentDay);
        for(let groupCounter = 0; groupCounter < data.days[dayCounter].plan.length; groupCounter++)
        {
            let group = data.days[dayCounter].plan[groupCounter];
            let currentGroupDiv = this.addDiv('group-day-plan');
            // TODO: replace below line of code "group.n * 10" with work units.
            currentGroupDiv.style.height = Math.round(100 * ((group.n * 20)  / (this.maxDailyWorkUnits + 150)), 0) + '%';
            //currentGroupDiv.style.backgroundColor = data.days[dayCounter].day <= this.groups[group.g].order_group_promised_date ? '#efefef' : '#f2dede';
            currentGroupDiv.style.borderColor = this.groups[group.g].order_group_color === 'white' ? '#ffffff' : this.groups[group.g].order_group_color;
            currentGroupDiv.setAttribute('title', this.groups[group.g].order_group_name);
            currentGroupDiv.group = group;
            currentGroupDiv.manusInserted = 0;  
            let index = 0;
            // Loop manus
            for(let manuCounter = 0; manuCounter < this.totalManusByCurrentDay; manuCounter++)
            {
                let span = this.addElement('span', '', 'manu-item');

                // Space hasn't been occupied yet.
                if(currentDayDiv.manuPosition <= manuCounter && currentGroupDiv.manusInserted < group.n)
                {
                    span.style.borderRightColor = group.c;
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
    
    tableHeadRow.appendChild(this.addElement('th', 'Plan #'));
    tableHeadRow.appendChild(this.addElement('th', 'Group #'));    
    tableHeadRow.appendChild(this.addElement('th', 'Name'));
    tableHeadRow.appendChild(this.addElement('th', 'Color'));
    tableHeadRow.appendChild(this.addElement('th', 'Promised cut/completion date'));
    tableHeadRow.appendChild(this.addElement('th', 'Target cut/completion date')); 
    tableHeadRow.appendChild(this.addElement('th', 'Expected cut/completion date'));       
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
        let inputPromiseDate = this.addInput('text', 'form-control input-date date-stack'); /* promised date */
        let inputPromiseCutDate = this.addInput('text', 'form-control input-date date-stack'); /* promised cut date */
        let inputTargetDate = this.addInput('text', 'form-control input-date date-stack'); /* Target completion */
        let inputTargetCutDate = this.addInput('text', 'form-control input-date date-stack'); /* Target cut */
        let inputExpectedDate = this.addInput('text', 'form-control input-date date-stack'); /* Actual completion */
        let inputExpectedCutDate = this.addInput('text', 'form-control input-date date-stack'); /* Actual cut */

        if(groups[group.order_groupnbr] === true)
        {
            continue;
        }

        groups[group.order_groupnbr] = true;            
        this.rows.push({ 
            "inputName": inputName, 
            "inputColor": inputColor, 
            "inputPromiseDate": inputPromiseDate,
            "inputPromiseCutDate": inputPromiseCutDate,
            "inputTargetDate": inputTargetDate,
            "inputTargetCutDate" : inputTargetCutDate,
            "inputExpectedDate" : inputExpectedDate,
            "inputExpectedCutDate" : inputExpectedCutDate,
            "group": group, 
            "row": tableRow,
            "changed" : function(){
                return (this.inputName.value !== this.group.order_group_name 
                    || this.inputColor.value !== this.group.order_group_color 
                    || this.inputPromiseDate.value !== this.group.order_group_promised_date
                    || this.inputPromiseCutDate.value !== this.group.order_group_promised_cut_date
                    || this.inputTargetDate.value !== this.group.plan_group_target_date
                    || this.inputTargetCutDate.value !== this.group.plan_group_target_cut_date
                    || this.inputExpectedDate.value !== this.group.plan_group_expected_cut_date
                    || this.inputExpectedCutDate.value !== this.group.plan_group_expected_cut_date);
            },
            getJson: function(){
                return { 
                    plannbr: group.plannbr, 
                    groupnbr: group.groupnbr, 
                    name : this.inputName.value, 
                    color: this.inputColor.value, 
                    promiseddate: this.inputPromiseDate.value,
                    promisedcutdate: this.inputPromiseCutDate.value,
                    targetdate: this.inputTargetDate.value,
                    targetcutdate: this.inputTargetCutDate.value,
                    expecteddate: this.inputExpectedDate.value,
                    expectedcutdate: this.inputExpectedCutDate.value
                };
            }
        });

        inputName.context = this;
        inputName.value = group.order_group_name;
        inputName.originalvalue = group.order_group_name;
        inputName.row = tableRow;
        inputName.onkeyup = this.highlightOnChange;
        inputName.placeholder = 'Name...';
        inputName.maxlength = 50;

        inputColor.context = this;
        inputColor.value = group.order_group_color === 'white' ? '#ffffff' : group.order_group_color;
        inputColor.originalvalue = group.order_group_color === 'white' ? '#ffffff' : group.order_group_color;
        inputColor.row = tableRow;
        inputColor.onchange = this.highlightOnChange;            
        inputColor.maxlength = 7;

        inputPromiseDate.context = this;
        inputPromiseDate.value = group.order_group_promised_date;
        inputPromiseDate.originalvalue = group.order_group_promised_date;
        inputPromiseDate.row = tableRow;            
        inputPromiseDate.onkeyup = this.highlightOnChange;
        //inputPromiseDate.style.backgroundColor = group.due_date <= group.order_group_promised_date ? '#ffffff' : '#f2dede';            
        inputPromiseDate.placeholder = 'Customer promise date...';        
        inputPromiseDate.setAttribute('maxlength', 10);
        inputPromiseDate.style.fontWeight = 'bold';
        
        inputPromiseCutDate.context = this;
        inputPromiseCutDate.value = group.order_group_promised_cut_date;
        inputPromiseCutDate.originalvalue = group.order_group_promised_cut_date;
        inputPromiseCutDate.row = tableRow;            
        inputPromiseCutDate.onkeyup = this.highlightOnChange;
        inputPromiseCutDate.disabled = true;
        //inputPromiseCutDate.style.backgroundColor = group.due_date <= group.order_group_promised_date ? '#ffffff' : '#f2dede';            
        inputPromiseCutDate.placeholder = 'Customer promise cut date...';        
        inputPromiseCutDate.setAttribute('maxlength', 10);

        inputTargetDate.context = this;
        inputTargetDate.value = group.plan_group_target_date;
        inputTargetDate.originalvalue = group.plan_group_target_date;
        inputTargetDate.row = tableRow;
        inputTargetDate.onkeyup = this.highlightOnChange;
        inputTargetDate.placeholder = 'Target completion date...';
        inputTargetDate.title = 'Target completion date.';
        inputTargetDate.setAttribute('maxlength', 10);
        inputTargetDate.style.fontWeight = 'bold';
        
        inputTargetCutDate.context = this;
        inputTargetCutDate.value = group.plan_group_target_cut_date;
        inputTargetCutDate.originalvalue = group.plan_group_target_cut_date;
        inputTargetCutDate.row = tableRow;
        inputTargetCutDate.onkeyup = this.highlightOnChange;
        inputTargetCutDate.disabled = true;
        inputTargetCutDate.placeholder = 'Target cut date...';
        inputTargetCutDate.title = 'Target cut date.';
        inputTargetCutDate.setAttribute('maxlength', 10);
        
        inputExpectedDate.context = this;
        inputExpectedDate.value = group.plan_group_expected_date;
        inputExpectedDate.originalvalue = group.plan_group_expected_date;
        inputExpectedDate.row = tableRow;
        inputExpectedDate.onkeyup = this.highlightOnChange;
        inputExpectedDate.placeholder = 'Actual completion date...';
        inputExpectedDate.title = 'Actual completion date.';
        inputExpectedDate.setAttribute('maxlength', 10);
        inputExpectedDate.disabled = true;
        inputExpectedDate.style.fontWeight = 'bold';
        
        inputExpectedCutDate.context = this;
        inputExpectedCutDate.value = group.plan_group_expected_cut_date;
        inputExpectedCutDate.originalvalue = group.plan_group_expected_cut_date;
        inputExpectedCutDate.row = tableRow;
        inputExpectedCutDate.onkeyup = this.highlightOnChange;
        inputExpectedCutDate.disabled = true;
        inputExpectedCutDate.placeholder = 'Actual cut date...';
        inputExpectedCutDate.title = 'Actual cut date.';
        inputExpectedCutDate.setAttribute('maxlength', 10);
        inputExpectedCutDate.disabled = true;
        
        tableRow.appendChild(this.addElement('td', group.plannbr, 'table-cell'));
        tableRow.appendChild(this.addElement('td', group.order_groupnbr, 'table-cell'));
        tableRow.appendChild(this.addCell(inputName));
        tableRow.appendChild(this.addCell(inputColor));
        tableRow.appendChild(this.addCellArray([inputPromiseCutDate, inputPromiseDate]));
        tableRow.appendChild(this.addCellArray([inputTargetCutDate, inputTargetDate]));
        tableRow.appendChild(this.addCellArray([inputExpectedCutDate, inputExpectedDate]));
        
        tableBody.appendChild(tableRow);
    }
        
    rootElement.appendChild(table);
};

CutPlannerApp.prototype.loadHtml = function(widget_element_id){        
    var self = this;
    let section = document.createElement('section');
    
    self.loadingDiv = self.addDiv('loading', 'Loading please wait...');
    section.appendChild(self.loadingDiv);
    
    // Generate widget
    document.getElementById(widget_element_id).appendChild(section);
    
    if(RBT !== null){
        RBT.jsonServerURL = 'http://ds3.coldlogic.com:24089/';
    }
    
    this.loadJson(function(data){
                                
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
              
        self.loadingDiv.style.display = 'none';
    }, 0, 'json');
};

CutPlannerApp.prototype.loadJson = function(callback, plannbr, action, rows){
    let post = { 
        "id": "rbt_widget_CutPlanner", 
        "action": action, 
        "value": plannbr, 
        "values": (typeof rows !== "undefined" ? rows : []) 
    };
    //console.log(post);
    this.loadingDiv.style.display = '';
    RBT.putGetJson('cutplanner', JSON.stringify(post), callback, null);
};
