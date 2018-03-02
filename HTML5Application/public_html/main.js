function CutPlannerApp(){    
    
    // UI properties
    this.maxDayHeight = 500;
    this.maxDailyWorkUnits = 1270;   
    
    // Data arrays
    this.dataPlanElements = [];
    this.dataDayElements = [];
    this.dataGroupElements = [];
};

CutPlannerApp.prototype.addDiv = function(className, text){
    var div = document.createElement('div');
    div.setAttribute('class', className);   
    div.innerHTML = (typeof text === "undefined" ? '' : text);
    
    return div;
};

CutPlannerApp.prototype.addElement = function(tagName, text, className){
    var element = document.createElement(tagName);
    element.className = typeof className !== "undefined" ? className :  '';
    element.innerHTML = text;    
    
    return element;
};

CutPlannerApp.prototype.addInput = function(type, className){
    var element = document.createElement('input');
    element.setAttribute('type', type);
    element.className = typeof className !== "undefined" ? className :  '';
    
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

CutPlannerApp.prototype.loadHtml= function(widgetElementId){        
    let data = this.loadJson();
    let section = document.createElement('section');
    
    // Build grid
    for(let planCounter = 0; planCounter < data.length; planCounter++)
    {
        let currentPlanDiv = this.addDiv('plan-container');       
        this.dataPlanElements.push(currentPlanDiv);  
        section.appendChild(currentPlanDiv);

        // Loop days
        for(let dayCounter = 0; dayCounter < data[planCounter].when_planned.length; dayCounter++)
        {
            let currentDayDiv = this.addDiv('day-plan');
            currentDayDiv.manuPosition = 0;
            currentDayDiv.style.height = this.maxDayHeight + 'px';
            currentDayDiv.appendChild(this.addElement('h4', data[planCounter].when_planned[dayCounter].when_to_do.when_planned_done));
            currentPlanDiv.appendChild(currentDayDiv);
            this.dataDayElements.push(currentPlanDiv);
            
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
                currentGroupDiv.onclick = function(){
                    inputId.value = this.group.groupnbr;
                    inputName.value = this.group.types;
                    inputColor.value = this.group.type_color;
                    inputDate.value = this.group.earliest_due_date;
                    divFormGroup4.innerHTML = 'Group #: ' + this.group.groupnbr + ', Orders: ' + this.group.orders + ', Manus: ' + this.group.manus + ', Pseudo: ' + this.group.pseudo + ', Fabrics: ' + this.group.fabrics + ', Closed: ' + this.group.closed;
                };                
                
                // Loop manu's
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
                this.dataGroupElements.push(currentGroupDiv);
            }
            
        }
    }
    
    // Build forms
    let divRow = this.addDiv('row');
    let divColHalf1 = this.addDiv('col-md-6');
    let divColHalf2 = divColHalf1.cloneNode(false);
    let divDetailBox1 = this.addDiv('detail-box');
    let divDetailBox2 = divDetailBox1.cloneNode(false);
    let divDetailTitle1 = this.addDiv('detail-title');
    let divDetailTitle2 = divDetailTitle1.cloneNode(false);
    let divDetailContent1 = this.addDiv('detail-content');
    let divDetailContent2 = this.addDiv('detail-content');
    let divFormGroup1 = this.addDiv('form-group');
    let divFormGroup2 = divFormGroup1.cloneNode(false);
    let divFormGroup3 = divFormGroup1.cloneNode(false);
    let divFormGroup4 = divFormGroup1.cloneNode(false);
    let divFormGroup5 = this.addDiv('form-group-right');
    let inputName = this.addInput('text', 'input-name');
    let inputColor = this.addInput('color');
    let inputDate = this.addInput('text', 'input-date');
    let inputId = this.addInput('hidden');
    
    let buttonSubmit = this.addInput('submit', 'btn btn-primary');
    buttonSubmit.onclick = function(){
        console.log("Save changes here"); // TODO: Post JSON object to server.
    };
    
    divDetailContent1.appendChild(inputId);

    divFormGroup1.appendChild(this.addElement('label', 'Name:', 'detail-label'));
    divFormGroup1.appendChild(inputName);
    divDetailContent1.appendChild(divFormGroup1); 
    
    divFormGroup2.appendChild(this.addElement('label', 'Color:', 'detail-label'));
    divFormGroup2.appendChild(inputColor);
    divDetailContent1.appendChild(divFormGroup2); 
    
    divFormGroup3.appendChild(this.addElement('label', 'Due by:', 'detail-label'));
    divFormGroup3.appendChild(inputDate);
    divDetailContent1.appendChild(divFormGroup3); 
    
    divDetailContent1.appendChild(divFormGroup4);
    
    divFormGroup5.appendChild(buttonSubmit);
    divDetailContent1.appendChild(divFormGroup5);
        
    divDetailContent2.appendChild(this.addElement('label', 'On schedule:', 'legend-item-label'));
    divDetailContent2.appendChild(this.addElement('span', '', 'legend-item-default'));
    divDetailContent2.appendChild(this.addElement('label', 'Past due date:', 'legend-item-label'));
    divDetailContent2.appendChild(this.addElement('span', '', 'legend-item-default legend-item-late'));
    divDetailTitle1.innerHTML = 'Detail:';
    divDetailTitle2.innerHTML = 'Legend:';    
    divDetailBox1.appendChild(divDetailTitle1);
    divDetailBox2.appendChild(divDetailTitle2);
    divDetailBox1.appendChild(divDetailContent1);
    divDetailBox2.appendChild(divDetailContent2);
    divColHalf1.appendChild(divDetailBox1);
    divColHalf2.appendChild(divDetailBox2);
    divRow.appendChild(divColHalf1);
    divRow.appendChild(divColHalf2);
    
    section.appendChild(divRow);    
    document.getElementById(widgetElementId).appendChild(section);
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
                                "type_color": "#bf5cd5"
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
                                "type_color": "#bf5cd5"
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

