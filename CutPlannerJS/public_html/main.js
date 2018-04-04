function CutPlannerApp(){    
    
    // UI properties
    this.maxDayHeight = 500;
    this.maxDailyWorkUnits = 1270;   
    this.rows = [];
    this.groups = [];
    this.buckets = [];
    this.selected = 0;
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

CutPlannerApp.prototype.subtractDaysFromDate = function(str, days){
    let parts = str.split('-');
    let date = new Date(parts[0], parts[1], parts[2]);
    date.setDate(date.getDate()-days);
    let ret = date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()) + '-' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    //console.log(ret);
    
    return ret;
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

CutPlannerApp.prototype.highlightOnChange = function(context){
    if(context.value !== context.originalvalue){
        context.row.style.background = '#ffe160';
    }
    
    //context.buttonAddNew.disabled = false;
};

CutPlannerApp.prototype.buttonToggle = function(buttons, value){
    for(let i = 0; i < buttons.length; i++){
        buttons[i].disabled = value;
    }
};

CutPlannerApp.prototype.isCurrentPlan = function(data, plan){
    return data.current_plannbr === plan.plannbr;
};

CutPlannerApp.prototype.startLoading = function(context){
    context.loadingDiv.style.display = '';
};

CutPlannerApp.prototype.doneLoading = function(context){
    context.loadingDiv.style.display = 'none';
};

CutPlannerApp.prototype.refreshAll = function(context, plannbr, action, values){    
    context.loadJson(function(data){
        
        if(action !== 'save-only') {
            // Refreshes the menu
            context.menuDiv.removeChild(context.menuDiv.firstChild);
            context.buildPlanSelector(context.menuDiv, data, plannbr);

            // Refreshes the grid
            context.gridDiv.removeChild(context.gridDiv.firstChild);
            context.buildBucketGrid(context.gridDiv, data);  

            // Refresh the list view
            context.listDiv.removeChild(context.listDiv.firstChild);
            context.buildGroupList(context.listDiv, data);
        }
        
        context.doneLoading(context);
    }, plannbr, action, values);
};

CutPlannerApp.prototype.refreshBucketAndGroupList = function(context, plannbr, action, values) {
    context.loadJson(function(data){  
        
        if(action !== 'save-only') {
            // Refreshes the grid
            context.gridDiv.removeChild(context.gridDiv.firstChild);
            context.buildBucketGrid(context.gridDiv, data);  

            // Refresh the list view
            context.listDiv.removeChild(context.listDiv.firstChild);
            context.buildGroupList(context.listDiv, data);
        }
        
        context.doneLoading(context);
    }, plannbr, action, values);
};

CutPlannerApp.prototype.repaintGui = function(self){
    
    let changes = [];
    
    // Update list view
    for(let i = 0; i < self.rows.length; i++){

        // Remove on change hightlight
        self.rows[i].row.style.background = '#ffffff';

        // Update border colors
        if(self.rows[i].colorChanged() || self.rows[i].nameChanged()){
            for(let j = 0; j < self.buckets[self.rows[i].group.order_groupnbr].length; j++){
                // Handle color
                self.buckets[self.rows[i].group.order_groupnbr][j].style.borderColor = 
                        self.rows[i].inputColor.value;
                
                // Handle name
                self.buckets[self.rows[i].group.order_groupnbr][j].title = 
                        self.rows[i].inputName.value + ': ' + 
                        self.buckets[self.rows[i].group.order_groupnbr][j].n + ' manus';
            }
        }
        
        // Update promiseCut date
        if(self.rows[i].promiseDateChanged()){
            // Change cut date
            self.rows[i].inputPromiseCutDate.value = self.subtractDaysFromDate(self.rows[i].inputPromiseDate.value, 3);
            // Set background to red
            if(self.rows[i].inputPromiseDate.value < self.rows[i].inputExpectedDate.value){
                self.rows[i].inputPromiseDate.style.backgroundColor =  '#ff6666';
            }else{
                self.rows[i].inputPromiseDate.style.backgroundColor =  '#ffffff';
            }
        }
        
        // Collect list of changes
        if(self.rows[i].nameChanged() || self.rows[i].colorChanged() || self.rows[i].promiseDateChanged()){
            changes.push(self.rows[i].getJson());
        }
    }
    
    // Refresh draft list and select current
    self.refreshBucketAndGroupList(self, self.selected, 'save-only', changes);  
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
    this.selected = typeof plannbr !== "undefined" ? plannbr : 0;
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
    
    // Plans drop down menu
    for(let i = 0; i < data.plans.length; i++){
        data.plans[i].is_current_plan = this.isCurrentPlan(data, data.plans[i]);
        let option = this.addElement('a', data.plans[i].plan_name + (data.plans[i].is_current_plan ? ' &#x2714;' : ''), 'dropdown-item');
        //option.context = this;        
        option.onclick = function(){
            
            // Set selected plan
            self.selected = data.plans[i].plannbr;
            selectedIsCurrent = data.plans[i].is_current_plan;
            
            // Set message text
            msgPlanWorkingOn.innerHTML = 'Now editing: ' + data.plans[i].plan_name + (selectedIsCurrent ? ' (Current)' : '') + '...';
            dropDownPlanSelectorButton.innerHTML = this.innerHTML;

            // Toggle buttons
            self.buttonToggle([buttonRemove, buttonPlanUpdate], selectedIsCurrent);
            self.buttonToggle([buttonAddNew], false);

            // Refreshes the grid            
            self.refreshBucketAndGroupList(self, self.selected, 'json');
        };
        
        // If selected otherwise select current.
        if(self.selected === data.plans[i].plannbr || (self.selected === 0 && data.plans[i].is_current_plan)){
            option.click();
        }
        
        dropDownPlanSelectorOptions.appendChild(option);
    }
        
    // Add new plan button
    this.buttonAddNew = buttonAddNew;
    buttonAddNew.value = 'New';
    buttonAddNew.title = 'Add a new plan.';
    buttonAddNew.disabled = false;
    buttonAddNew.onclick = function(){
        
        // Set message text
        msgPlanWorkingOn.innerHTML = 'Working on a new plan...';
        dropDownPlanSelectorButton.innerHTML = dropDownMenuText;

        // Toggle the buttons
        self.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], true);
        
        // Refreshes the grid            
        self.refreshAll(self, 0, 'new-plan');
    };
    
    // Remove plan button
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
                    //self.refreshBucketAndGroupList(self, selected, 'remove-plan');
                    self.refreshAll(self, self.selected, 'remove-plan');
                }
            }                        
        }
    };
        
    // Set as current plan button
    buttonPlanUpdate.value = 'Set as Current Plan';
    buttonPlanUpdate.title = 'Set this plan as the current factory plan.';
    buttonPlanUpdate.disabled = true;
    buttonPlanUpdate.addEventListener('click', function(){
        if(confirm('Are you sure you want to replace the current plan with this one?')){
            // Refreshes the grid            
            self.refreshAll(self, self.selected, 'set-current'); 
            
            // Disable remove since we don't want to delete current plan.
            buttonRemove.disabled = true;
        }
    });
    
    // Reset button
    this.buttonReset = this.addInput('button', 'btn float-right');
    this.buttonReset.value = 'Reset';
    this.buttonReset.disabled = true;
    this.buttonReset.onclick = function(){
        self.refreshAll(self, self.selected, 'json');
    };

    // Save button
    this.buttonSaveListView = this.addInput('button', 'btn float-right');        
    this.buttonSaveListView.value = 'Compute New Schedule';
    this.buttonSaveListView.disabled = true;
    this.buttonSaveListView.onclick = function(){

        let changes = [];
        //let targetDateChanged = false;
        for(let i = 0; i < self.rows.length; i++){

            //if(self.rows[i].targetDateChanged()){
            //    targetDateChanged = true;
            //}
            
            if(self.rows[i].changed()){
                changes.push(self.rows[i].getJson());
            }
        }
        
        // Update GUI manually
        //if(!targetDateChanged){
        //    self.repaintGui(self);
        //}
        
        // Toggle buttons
        self.buttonToggle([buttonPlanUpdate, buttonAddNew, buttonRemove], false);
        
        // Refresh draft list and select current
        self.refreshBucketAndGroupList(self, self.selected, 'save-plan', changes);        
        
        this.disabled = true;
        this.className = 'btn float-right';
    };
    
    menuContainer.appendChild(dropDownPlanSelector);
    menuContainer.appendChild(buttonAddNew);
    menuContainer.appendChild(buttonRemove);
    menuContainer.appendChild(msgPlanWorkingOn);
    menuContainer.appendChild(this.buttonSaveListView);
    menuContainer.appendChild(this.buttonReset);
    menuContainer.appendChild(buttonPlanUpdate); 
};

CutPlannerApp.prototype.buildBucketGrid = function(rootElement, data){

    let currentPlanDiv = this.addDiv('plan-container');       
    rootElement.appendChild(currentPlanDiv);
    
    this.groups = [];
    this.buckets = [];
    
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
        this.manuWidthForCurrentDay = parseFloat(180 / this.totalManusByCurrentDay).toFixed(2);

        let currentGroupDiv = []; // To hold matching groups
        currentDayDiv.divGroups = [];
       
        // Add colored manus
        for(let groupCounter = 0; groupCounter < data.days[dayCounter].plan.length; groupCounter++)
        {
            let group = data.days[dayCounter].plan[groupCounter];
            
            if(typeof currentGroupDiv[group.g] === "undefined"){
                currentGroupDiv[group.g] = this.addDiv('group-day-plan');
                currentGroupDiv[group.g].n = group.n;
                currentDayDiv.appendChild(currentGroupDiv[group.g]);
                currentDayDiv.divGroups.push(currentGroupDiv[group.g]);
                
                // Used in repaint GUI
                if(typeof this.buckets[group.g] === "undefined")
                {
                    this.buckets[group.g] = [];
                }
                
                this.buckets[group.g].push(currentGroupDiv[group.g]);
            }else{
                currentGroupDiv[group.g].manusInserted = currentGroupDiv[group.g].n; 
                currentGroupDiv[group.g].n += group.n;
            }
            
            currentGroupDiv[group.g].style.height = Math.round(90 * (currentGroupDiv[group.g].n  / this.totalManusByCurrentDay), 0) + '%';
            currentGroupDiv[group.g].style.borderColor = this.groups[group.g].order_group_color === 'white' ? '#ffffff' : this.groups[group.g].order_group_color;
            currentGroupDiv[group.g].title = this.groups[group.g].order_group_name + ': ' + currentGroupDiv[group.g].n + ' manus';

            // Loop manus
            for(let manuCounter = 0; manuCounter < group.n; manuCounter++)
            {
                let span = this.addElement('span', '', 'manu-item');
                span.style.borderRightColor = group.c; /* backgroundColor */
                span.style.borderRightWidth = this.manuWidthForCurrentDay-1 + 'px';
                span.style.borderRightStyle = 'solid';
                span.style.borderLeft = '1px solid transparent';
                currentGroupDiv[group.g].appendChild(span);
                currentDayDiv.manuPosition++;
            }
        }
        
        // Add whitespace
        let whiteSpace = 0;
        for(let i = 0; i < currentDayDiv.divGroups.length; i++){ // Loops buckets.
            
            for(let j = 0; j < whiteSpace; j++){
                let span = this.addElement('span', '', 'manu-item');
                span.style.width = this.manuWidthForCurrentDay + 'px';
                currentDayDiv.divGroups[i].insertBefore(span, currentDayDiv.divGroups[i].firstChild);
            }
            
            whiteSpace += currentDayDiv.divGroups[i].n;
        }
    }
};

CutPlannerApp.prototype.buildGroupList = function(rootElement, data){
    let self = this;
    let groups = [];
    let table = this.addElement('table', '', 'table');
    let tableHead = this.addElement('thead', '', 'table-header-group');
    let tableHeadRow = this.addElement('tr', '', 'table-row');
    let tableBody = this.addElement('tbody', '', 'table-body');    
    
    tableHeadRow.appendChild(this.addElement('th', 'Plan #'));
    tableHeadRow.appendChild(this.addElement('th', 'Group #'));    
    tableHeadRow.appendChild(this.addElement('th', 'Name'));
    tableHeadRow.appendChild(this.addElement('th', 'Color'));
    tableHeadRow.appendChild(this.addElement('th', 'Customer Promised'));
    tableHeadRow.appendChild(this.addElement('th', 'Target Date')); 
    tableHeadRow.appendChild(this.addElement('th', 'Expected Date'));       
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
        let inputPromiseDate = this.addInput('date', 'form-control input-date date-stack'); /* promised date */
        let inputPromiseCutDate = this.addInput('date', 'form-control input-date date-stack'); /* promised cut date */
        let inputTargetDate = this.addInput('date', 'form-control input-date date-stack'); /* Target completion */
        let inputTargetCutDate = this.addInput('date', 'form-control input-date date-stack'); /* Target cut */
        let inputExpectedDate = this.addInput('date', 'form-control input-date date-stack'); /* Actual completion */
        let inputExpectedCutDate = this.addInput('date', 'form-control input-date date-stack'); /* Actual cut */

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
                    || this.inputExpectedDate.value !== this.group.plan_group_expected_date
                    || this.inputExpectedCutDate.value !== this.group.plan_group_expected_cut_date);
            },
            "targetDateChanged" : function(){
                return this.inputTargetDate.value !== this.group.plan_group_target_date;
            },
            "promiseDateChanged" : function(){
                return this.inputPromiseDate.value !== this.group.order_group_promised_date;
            },
            "colorChanged" : function(){
                return this.inputColor.value !== this.group.order_group_color;
            },
            "nameChanged" : function(){
                return this.inputName.value !== this.group.order_group_name;
            },
            getJson: function(){
                return { 
                    plannbr: group.plannbr, 
                    groupnbr: group.order_groupnbr, 
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
        inputName.onkeyup = function(){
            self.highlightOnChange(this);
            self.repaintGui(self);
        };
        inputName.placeholder = 'Name...';
        inputName.maxlength = 50;
        inputName.style.border = '1px solid #333';
        inputName.style.color = '#000000';

        inputColor.context = this;
        inputColor.value = group.order_group_color === 'white' ? '#ffffff' : group.order_group_color;
        inputColor.originalvalue = group.order_group_color === 'white' ? '#ffffff' : group.order_group_color;
        inputColor.row = tableRow;
        inputColor.onchange = function(){
            self.highlightOnChange(this);
            self.repaintGui(self);
        };            
        inputColor.maxlength = 7;
        inputColor.style.border = '1px solid #333';

        inputPromiseDate.context = this;
        inputPromiseDate.value = group.order_group_promised_date;
        inputPromiseDate.originalvalue = group.order_group_promised_date;
        inputPromiseDate.row = tableRow;            
        inputPromiseDate.onchange = function(){
            self.highlightOnChange(this);
            self.repaintGui(self);
        };
        if(group.order_group_promised_date < group.plan_group_expected_date){
            inputPromiseDate.style.backgroundColor =  '#ff6666';
        }                    
        inputPromiseDate.placeholder = 'Customer promise date...';        
        inputPromiseDate.setAttribute('maxlength', 10);
        inputPromiseDate.style.fontWeight = 'bold';
        inputPromiseDate.style.border = '1px solid #333';
        inputPromiseDate.style.color = '#000000';
        
        inputPromiseCutDate.context = this;
        inputPromiseCutDate.value = group.order_group_promised_cut_date;
        inputPromiseCutDate.originalvalue = group.order_group_promised_cut_date;
        inputPromiseCutDate.row = tableRow;            
        inputPromiseCutDate.onchange = this.highlightOnChange;
        inputPromiseCutDate.disabled = true;
        //inputPromiseCutDate.style.backgroundColor = group.due_date <= group.order_group_promised_date ? '#ffffff' : '#f2dede';            
        inputPromiseCutDate.placeholder = 'Customer promise cut date...';        
        inputPromiseCutDate.setAttribute('maxlength', 10);

        inputTargetDate.context = this;
        inputTargetDate.value = group.plan_group_target_date;
        inputTargetDate.originalvalue = group.plan_group_target_date;
        inputTargetDate.row = tableRow;
        inputTargetDate.onchange = function(){
            
            let changed = false;
            for(let i = 0; i < self.rows.length; i++){
                if(self.rows[i].targetDateChanged())
                {
                    changed = true;
                }
            }
            
            self.buttonSaveListView.disabled = !changed;
            self.buttonSaveListView.className = changed ? 'btn btn-primary float-right' : 'btn float-right';
            
            self.buttonReset.disabled = !changed;
            self.buttonReset.className = changed ? 'btn btn-secondary float-right' : 'btn float-right';
        };
        if(group.plan_group_target_date < group.plan_group_expected_date){
            inputTargetDate.style.backgroundColor =  '#ff6666';
        }
        inputTargetDate.placeholder = 'Target completion date...';
        inputTargetDate.title = 'Target completion date.';
        inputTargetDate.setAttribute('maxlength', 10);
        inputTargetDate.style.fontWeight = 'bold';
        inputTargetDate.style.border = '1px solid #333';
        inputTargetDate.style.color = '#000000';
        
        inputTargetCutDate.context = this;
        inputTargetCutDate.value = group.plan_group_target_cut_date;
        inputTargetCutDate.originalvalue = group.plan_group_target_cut_date;
        inputTargetCutDate.row = tableRow;
        inputTargetCutDate.onchange = this.highlightOnChange;
        inputTargetCutDate.disabled = true;
        inputTargetCutDate.placeholder = 'Target cut date...';
        inputTargetCutDate.title = 'Target cut date.';
        inputTargetCutDate.setAttribute('maxlength', 10);
        
        inputExpectedDate.context = this;
        inputExpectedDate.value = group.plan_group_expected_date;
        inputExpectedDate.originalvalue = group.plan_group_expected_date;
        inputExpectedDate.row = tableRow;
        inputExpectedDate.onchange = this.highlightOnChange;
        inputExpectedDate.placeholder = 'Actual completion date...';
        inputExpectedDate.title = 'Actual completion date.';
        inputExpectedDate.setAttribute('maxlength', 10);
        inputExpectedDate.disabled = true;
        inputExpectedDate.style.fontWeight = 'bold';
        
        inputExpectedCutDate.context = this;
        inputExpectedCutDate.value = group.plan_group_expected_cut_date;
        inputExpectedCutDate.originalvalue = group.plan_group_expected_cut_date;
        inputExpectedCutDate.row = tableRow;
        inputExpectedCutDate.onchange = this.highlightOnChange;
        inputExpectedCutDate.disabled = true;
        inputExpectedCutDate.placeholder = 'Actual cut date...';
        inputExpectedCutDate.title = 'Actual cut date.';
        inputExpectedCutDate.setAttribute('maxlength', 10);
        inputExpectedCutDate.disabled = true;
        
        tableRow.appendChild(this.addElement('td', group.plannbr, 'table-cell center'));
        tableRow.appendChild(this.addElement('td', group.order_groupnbr, 'table-cell center'));
        tableRow.appendChild(this.addCell(inputName));
        tableRow.appendChild(this.addCell(inputColor));
        
        let pDiv = this.addDiv('clear');
        let p2Div = this.addDiv('clear');
        pDiv.appendChild(this.addElement('span', 'Cut: ', 'label'));
        pDiv.appendChild(inputPromiseCutDate);
        
        p2Div.appendChild(this.addElement('span', 'Done: ', 'label'));
        p2Div.appendChild(inputPromiseDate);        
        tableRow.appendChild(this.addCellArray([pDiv,p2Div]));
        
        let tDiv = this.addDiv('clear');
        let t2Div = this.addDiv('clear');
        tDiv.appendChild(this.addElement('span', 'Cut: ', 'label'));
        tDiv.appendChild(inputTargetCutDate);
        
        t2Div.appendChild(this.addElement('span', 'Done: ', 'label'));
        t2Div.appendChild(inputTargetDate)        
        tableRow.appendChild(this.addCellArray([tDiv, t2Div]));
        
        let eDiv = this.addDiv('clear');
        let e2Div = this.addDiv('clear');
        eDiv.appendChild(this.addElement('span', 'Cut: ', 'label'));
        eDiv.appendChild(inputExpectedCutDate);
        
        e2Div.appendChild(this.addElement('span', 'Done: ', 'label'));
        e2Div.appendChild(inputExpectedDate)    
        tableRow.appendChild(this.addCellArray([eDiv, e2Div]));
        
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
    this.startLoading(this);
    RBT.putGetJson('cutplanner', JSON.stringify(post), callback, null);
};
