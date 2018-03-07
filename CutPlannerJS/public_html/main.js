function CutPlannerApp(){    
    
    // UI properties
    this.maxDayHeight = 500;
    this.maxDailyWorkUnits = 1270;   
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

CutPlannerApp.prototype.buildLegendForCustomers = function(element){
    
    for(var key in this.dataCustomerElements){
        let span = this.addElement('span', '', 'legend-item-default');
        span.style.borderColor = this.dataCustomerElements[key];
        element.appendChild(this.addElement('label', key + ':', 'legend-item-label'));
        element.appendChild(span);
    }
};

CutPlannerApp.prototype.buildGrid = function(rootElement, data){
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
            currentDayDiv.appendChild(this.addElement('h4', data[planCounter].when_planned[dayCounter].when_to_do.when_planned_done));
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

/*
CutPlannerApp.prototype.buildActionMenu = function(rootElement){
    // Build action buttons
    let divActionRow = this.addDiv('action-container');
    this.buttonPlanUpdate = this.addInput('button', 'btn btn-primary');
    this.buttonPlanUpdate.value = 'Update Plan';
    this.buttonPlanUpdate.context = this;
    this.buttonPlanUpdate.disabled = true;
    this.buttonPlanUpdate.addEventListener('click', function(){
        // TODO: Send JSON changes to server
        console.log('Grid should be refreshed here.');
        
        // Refreshes the grid
        this.context.gridDiv.removeChild(this.context.gridDiv.firstChild);
        this.context.buildGrid(this.context.gridDiv, this.context.loadJson());        
    });
    
    divActionRow.appendChild(this.buttonPlanUpdate);
    rootElement.appendChild(divActionRow);
};*/

CutPlannerApp.prototype.buildListView = function(rootElement, data){
    // Build list view
    let divRow = this.addDiv('list-container');
    for(let planCounter = 0; planCounter < data.length; planCounter++)
    {
        let detailList = this.addDiv('detail-list');        
        divRow.appendChild(detailList);
        
        // Loop days
        for(let dayCounter = 0; dayCounter < data[planCounter].when_planned.length; dayCounter++)
        {
            let day = data[planCounter].when_planned[dayCounter];
            let divDay = this.addDiv('detail-list-day row');
            let divDayContent = this.addDiv('detail-list-day-content col-md-12');

            divDay.appendChild(divDayContent);
            detailList.appendChild(divDay);
              
            for(let groupCounter = 0; groupCounter < data[planCounter].when_planned[dayCounter].groups.length; groupCounter++)
            {
                let group = day.groups[groupCounter];                
                let divGroup = this.addDiv('detail-list-day-group');                
                let inputName = this.addInput('text', 'input-name');                 
                let inputColor = this.addInput('color', 'input-color');                
                let inputDate = this.addInput('text', 'input-date');                
                let buttonSubmit = this.addInput('button', 'btn btn-primary');
                
                group.day = day.when_to_do.when_planned_done;
                inputDate.value = group.earliest_due_date;
                inputDate.style.backgroundColor = group.day <= group.earliest_due_date ? '#ffffff' : '#f2dede';
                inputColor.value = group.type_color;
                inputName.value = group.types;
                buttonSubmit.context = this;
                buttonSubmit.value = 'Save Changes';
                buttonSubmit.group = group;
                buttonSubmit.inputName = inputName;
                buttonSubmit.inputColor = inputColor;
                buttonSubmit.inputDate = inputDate;
                buttonSubmit.onclick = function(){
                    let changed = this.inputName.value !== this.group.types;
                    changed = changed || this.inputColor.value !== this.group.type_color;
                    changed = changed || this.inputDate.value !== this.group.earliest_due_date;
                    
                    if(changed){
                        let json = {"action" : "save-as-draft",
                                    "groupnbr" : this.group.groupnbr, 
                                    "controldate" : this.inputDate.value,
                                    "types" : this.inputName.value,
                                    "group_color" : this.inputColor.value
                                    };
                        this.context.buttonPlanUpdate.disabled = false; 
                        divGroup.style.background = '#ffe160';
                        /*
                        RBT.putGetJson('CutPlanner', json, function(response){                             
                            console.log(JSON.stringify(response));
                            if(response.success){
                                if(response.user.permission_to_change_plan){
                                    console.log('Enable save plan button');
                                    
                                }
                            }
                            
                            alert(response.message);
                        }, this);*/
                        
                    }
                    else {
                        alert('Nothing to update. Please make a change first.');
                    }
                };
                divGroup.appendChild(inputName);
                divGroup.appendChild(inputColor);
                divGroup.appendChild(inputDate);
                divGroup.appendChild(buttonSubmit);
                divDayContent.appendChild(divGroup);                         
            }
            
            divDay.appendChild(divDayContent);
        }
    }
    
    rootElement.appendChild(divRow); 
};

CutPlannerApp.prototype.buildPlanSelector = function(rootElement){
    let dropDownPlanSelector = this.addDiv('dropdown');
    let dropDownPlanSelectorButton = this.addElement('button', 'Select a draft plan', 'btn btn-secondary dropdown-toggle');
    let dropDownPlanSelectorOptions = this.addDiv('dropdown-menu');
    let buttonAddNew = this.addInput('button', 'btn btn-success');
    let msgPlanWorkingOn = this.addElement('span', '', 'msg-current-plan');
    let dropDownMenuIdentifier = 'dropdownMenuButton_' + Math.floor((Math.random() * 10000000000) + 1);
    
    msgPlanWorkingOn.innerHTML = 'Working on a new plan...';
    
    dropDownPlanSelectorButton.id = dropDownMenuIdentifier;
    dropDownPlanSelectorButton.setAttribute('data-toggle', 'dropdown');
    dropDownPlanSelectorButton.setAttribute('aria-haspopup', 'true');
    dropDownPlanSelectorButton.setAttribute('aria-expanded', 'false');
    dropDownPlanSelectorButton.setAttribute('type', 'button');
    
    dropDownPlanSelectorOptions.setAttribute('aria-labelledby', dropDownMenuIdentifier);
    
    dropDownPlanSelector.appendChild(dropDownPlanSelectorButton);
    dropDownPlanSelector.appendChild(dropDownPlanSelectorOptions);
    
    for(let i = 0; i < 10; i++){
        let option = this.addElement('a', 'Plan #' + (i+1), 'dropdown-item');
        option.context = this;
        option.onclick = function(){
            console.log('You\'ve selected option: ' + option.innerHTML);
            msgPlanWorkingOn.innerHTML = 'Now editing plan #' + (i+1) + '...';
            buttonAddNew.disabled = false;
            this.context.buttonPlanUpdate.disabled = false;
        }
        dropDownPlanSelectorOptions.appendChild(option);
    }
        
    buttonAddNew.value = '+';
    buttonAddNew.title = 'Add a new plan.';
    buttonAddNew.disabled = true;
    buttonAddNew.context = this;
    buttonAddNew.onclick = function(){
        console.log('Creating a new plan.');
        msgPlanWorkingOn.innerHTML = 'Working on a new plan...';
        this.context.buttonPlanUpdate.disabled = true;
        this.disabled = true;
    };
    
    this.buttonPlanUpdate = this.addInput('button', 'btn btn-primary float-right');
    this.buttonPlanUpdate.value = 'Set as Current Plan';
    this.buttonPlanUpdate.context = this;
    this.buttonPlanUpdate.disabled = true;
    this.buttonPlanUpdate.addEventListener('click', function(){
        // TODO: Send JSON changes to server
        console.log('Grid should be refreshed here.');
        
        // Refreshes the grid
        this.context.gridDiv.removeChild(this.context.gridDiv.firstChild);
        this.context.buildGrid(this.context.gridDiv, this.context.loadJson());        
    });

    rootElement.appendChild(dropDownPlanSelector);
    rootElement.appendChild(buttonAddNew);
    rootElement.appendChild(msgPlanWorkingOn);
    rootElement.appendChild(this.buttonPlanUpdate);
    
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
    this.buildGrid(this.gridDiv, data);    
    section.appendChild(this.gridDiv);
    
    // Build action menu
    //this.buildActionMenu(section);
    
    // Build list view
    this.buildListView(section, data);
    
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
                                "when_planned_done": "2018-03-12"
                        },
                        "groups": [{
                                "groupnbr": 19,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-12",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-13"
                        },
                        "groups": [{
                                "groupnbr": 20,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-13",
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
                }, {
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
                                "earliest_due_date": "2017-12-06",
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
                                "earliest_due_date": "2017-12-07",
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
                                "earliest_due_date": "2017-12-07",
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
                                "earliest_due_date": "2017-12-07",
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
                                "earliest_due_date": "2017-12-07",
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
                                "earliest_due_date": "2017-12-08",
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
                                "earliest_due_date": "2017-12-08",
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
                                "earliest_due_date": "2017-12-08",
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
                                "earliest_due_date": "2017-12-08",
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
                                "earliest_due_date": "2017-12-11",
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
                                "earliest_due_date": "2017-12-11",
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
                                "earliest_due_date": "2018-03-02",
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
                                "when_planned_done": "2018-03-12"
                        },
                        "groups": [{
                                "groupnbr": 19,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-12",
                                "types": "Pseudo Manu",
                                "hours_rep": 1.60,
                                "type_color": "#47e735"
                        }]
                }, {
                        "when_to_do": {
                                "when_planned_done": "2018-03-13"
                        },
                        "groups": [{
                                "groupnbr": 20,
                                "orders": 0,
                                "manus": 1,
                                "fabrics": 0,
                                "work_units": 240,
                                "pseudo": "Y",
                                "closed": "N",
                                "earliest_due_date": "2018-03-13",
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
