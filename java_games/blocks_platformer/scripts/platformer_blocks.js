let currentButton;
const codeButtonsTray = document.getElementById("code-buttons-tray")

function createCodeButton(name, parent, tools) {
    let codeButton = document.createElement("div")
    codeButton.classList.add("code-button")
    codeButton.textContent = name
    codeButton.addEventListener('click', enableCodeMode);
    parent.appendChild(codeButton)
    codeButton.tools = tools;
    return codeButton;
}

function changeButtonToolbox(button, tools) {
    if (tools == null)
        button.tools = []
    else
        button.tools = tools
}

function runButtonCode(button, context) {
    /* loadWorkspace(button);
    let code = javascript.javascriptGenerator.workspaceToCode(
        Blockly.getMainWorkspace(),
    ); */
    // Eval can be dangerous. For more controlled execution, check
    // https://github.com/NeilFraser/JS-Interpreter.
    if (button.eventsCode != null && "all" in button.eventsCode) {
        const event = button.eventsCode["all"];
        try {
            eval(event);
        } catch (error) {
            console.log(error);
        }
    }
}

function runEvent(button, eventName, context) {
    /* loadWorkspace(button);
    let code = javascript.javascriptGenerator.workspaceToCode(
        Blockly.getMainWorkspace(),
    ); */
    // Eval can be dangerous. For more controlled execution, check
    // https://github.com/NeilFraser/JS-Interpreter.
    if (button.eventsCode != null && eventName in button.eventsCode) {
        const event = button.eventsCode[eventName];
        try {
            eval(event);
        } catch (error) {
            console.log(error);
        }
    }
}

function runCode(codeStr, context) {
    /* loadWorkspace(button);
    let code = javascript.javascriptGenerator.workspaceToCode(
        Blockly.getMainWorkspace(),
    ); */
    // Eval can be dangerous. For more controlled execution, check
    // https://github.com/NeilFraser/JS-Interpreter.
    try {
        eval(codeStr);
    } catch (error) {
        console.log(error);
    }
}

function loadWorkspace(button) {
    const workspace = Blockly.getMainWorkspace();
    if (button.workspaceSave) {
        Blockly.serialization.workspaces.load(button.workspaceSave, workspace);
        setToolbox(workspace, button.tools)
    } else {
        workspace.clear();
    }
}

function generateButtonCodeFromWorkspace(button) {
    const workspace = Blockly.getMainWorkspace();
    if (button.workspaceSave) {
        Blockly.serialization.workspaces.load(button.workspaceSave, workspace);
        button.eventsCode = generateEventsDict(workspace);
    } else {
        workspace.clear();
    }
}

function save(button) {
    const workspace = Blockly.getMainWorkspace();
    const topBlocks = workspace.getTopBlocks();
    const workspaceSave = Blockly.serialization.workspaces.save(workspace,);
    button.workspaceSave = workspaceSave;
    button.eventsCode = generateEventsDict(workspace);
    console.log(button.workspaceSave);
}

function generateEventsDict(workspace) {
    const topBlocks = workspace.getTopBlocks();
    const allCode = javascript.javascriptGenerator.workspaceToCode(workspace,);
    var eventsDict = {"all": allCode}
    for (let block of topBlocks)
    {
        const type = block.type.split("_")[0];
        if (type == "event" || type == "func")
        {
            var eventCode = javascript.javascriptGenerator.blockToCode(block, false);
            eventsDict[block.type] = eventCode;
        }
    }
    return eventsDict;
}

function handleSave() {
    document.body.setAttribute('mode', 'select');
    save(currentButton);
}

function enableSelectMode() {
    document.body.setAttribute('mode', 'select');
    document.querySelectorAll('.code-button').forEach((btn) => {
        //btn.removeEventListener('click', runButtonCode);
        btn.addEventListener('click', enableCodeMode);
    });
}

function enablePlayMode() {
    document.body.setAttribute('mode', 'play');
    document.querySelectorAll('.code-button').forEach((btn) => {
        //btn.addEventListener('click', runButtonCode);
        btn.removeEventListener('click', enableCodeMode);
    });
}

function enableCodeMode(e) {
    document.body.setAttribute('mode', 'code');
    currentButton = e.target;
    loadWorkspace(currentButton);
}

document.querySelector('#edit').addEventListener('click', enableSelectMode);
//document.querySelector('#done').addEventListener('click', enablePlayMode);
document.querySelector('#save').addEventListener('click', handleSave);

enablePlayMode();
enableSelectMode();



// Block Definitions:
function setupBlockly() {
    //setupOfficialToolbox();
    //return;
    defineBlocks();
    setupCodeGenerator();
    setupDefaultToolbox();
}

function defineBlocks() {
    //Define the names, fields, connections etc of the blocks:
    Blockly.defineBlocksWithJsonArray([
        {
            type: "moveXY",
            message0: "move by X:%1 Y:%2",
            args0: [
                {
                    type: "field_number",
                    name: "xMove",
                    value: 0
                },
                {
                    type: "field_number",
                    name: "yMove",
                    value: 0
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        },
        {
            type: "ySpeed",
            message0: "set ySpeed to %1",
            args0: [
                {
                    type: "field_number",
                    name: "speed",
                    value: 0
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        },
        {
            type: "xSpeed",
            message0: "set xSpeed to %1",
            args0: [
                {
                    type: "field_number",
                    name: "speed",
                    value: 0
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        },
        {
            type: "size",
            message0: "set size to %1",
            args0: [
                {
                    type: "field_number",
                    name: "size",
                    value: 1
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        },
        {
            type: "gravity",
            message0: "set gravity to %1",
            args0: [
                {
                    type: "field_number",
                    name: "gravity",
                    value: 28
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        },
        {
            type: "func_jump",
            message0: "Function: Jump",
            nextStatement: null,
            colour: 0,
            inputsInline: true,
        },
        {
            type: "call_jump",
            message0: "Call: Jump",
            previousStatement: null,
            nextStatement: null,
            colour: 0,
            inputsInline: true,
        },
        {
            type: "event_up_pressed",
            message0: "Up pressed",
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "event_right_pressed",
            message0: "Right pressed",
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "event_left_pressed",
            message0: "Left pressed",
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "event_update",
            message0: "Update",
            previousStatement: null,
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "event_btn_red_pressed",
            message0: "Red pressed",
            previousStatement: null,
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "event_btn_green_pressed",
            message0: "Green pressed",
            previousStatement: null,
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "event_btn_blue_pressed",
            message0: "Blue pressed",
            previousStatement: null,
            nextStatement: null,
            colour: 100,
            inputsInline: true,
        },
        {
            type: "test",
            message0: "test %1",
            args0: [
                {
                    type: "field_number",
                    name: "value",
                    value: 0
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        },
        {
            type: "test_variable",
            message0: "test variable %1",
            args0: [
                {
                    type: "field_input",
                    name: "variable",
                    text: "variable"
                }
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 225,
            inputsInline: true,
        }
                              
    ]);
}

function setupCodeGenerator() {
    //Define the code for each block (that isn't a default block):

    //Events
    javascript.javascriptGenerator.forBlock['event_up_pressed'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['event_left_pressed'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['event_right_pressed'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['event_update'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['event_btn_red_pressed'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['event_btn_green_pressed'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['event_btn_blue_pressed'] = function (block) {return '';};
    javascript.javascriptGenerator.forBlock['func_jump'] = function (block) {return '';};

    //Functions
    javascript.javascriptGenerator.forBlock['call_jump'] = function (block) {
        const func_name = "func_jump";//block.getFieldValue('func_name');
        return 'runEvent(button, "'+func_name+'", context);\n';
    };

    javascript.javascriptGenerator.forBlock['moveY'] = function (block) {
        const value = block.getFieldValue('dist');
        return 'context.pos.y += ' + value + ';\n';
    };


    //Value changes
    javascript.javascriptGenerator.forBlock['moveXY'] = function (block) {
        const x = block.getFieldValue('moveX');
        const y = block.getFieldValue('moveY');
        return 'context.pos = context.pos.plus(new Vec('+x+','+y+'));\n';
    };

    javascript.javascriptGenerator.forBlock['moveY'] = function (block) {
        const value = block.getFieldValue('dist');
        return 'context.pos.y += ' + value + ';\n';
    };

    javascript.javascriptGenerator.forBlock['ySpeed'] = function (block) {
        const value = block.getFieldValue('speed');
        return 'context.ySpeed = ' + value + ';\n';
    };

    javascript.javascriptGenerator.forBlock['xSpeed'] = function (block) {
        const value = block.getFieldValue('speed');
        return 'context.xSpeed += ' + value + ';\n';
    };

    javascript.javascriptGenerator.forBlock['size'] = function (block) {
        const value = block.getFieldValue('size');
        return 'context.sizeFactor = ' + value + ';\n';
    };

    javascript.javascriptGenerator.forBlock['gravity'] = function (block) {
        const value = block.getFieldValue('gravity');
        return 'context.gravity = ' + value + ';\n';
    };

    //Debug
    javascript.javascriptGenerator.forBlock['test'] = function (block) {
        const value = "'" + block.getFieldValue('value') + "'";
        return 'console.log("Test = " + ' + value + ');\n';
    };

    javascript.javascriptGenerator.forBlock['test_variable'] = function (block) {
        const value = block.getFieldValue('variable');
        return 'console.log(context.' + value + ');\n';
    };
}

function setToolbox(workspace, blocks) {
    //blocks = ["xSpeed", "ySpeed", "size", "gravity"];
    let blockList = []
    for (let i = 0; i < blocks.length; i++) {
        blockList.push(toolboxOptions[blocks[i]]);
    }
    let toolbox = {
        kind: 'flyoutToolbox',
        contents: blockList,
    }
    workspace.updateToolbox(toolbox);
}

toolboxOptions = {
    "moveXY":{
        kind: 'block',
        type: 'moveXY',
    },
    "xSpeed":{
        kind: 'block',
        type: 'xSpeed',
    },
    "ySpeed":{
        kind: 'block',
        type: 'ySpeed',
    },
    "size":{
        kind: 'block',
        type: 'size',
    },
    "gravity":{
        kind: 'block',
        type: 'gravity',
    },
    "call_jump":{
        kind: 'block',
        type: 'call_jump',
    },
}

const defaultToolbox = {
    kind: 'flyoutToolbox',
    contents: [
        {
            kind: 'block',
            type: 'ySpeed',
        },
        {
            kind: 'block',
            type: 'xSpeed',
        },
        {
            kind: 'block',
            type: 'size',
        }
    ],
};

function setupDefaultToolbox() {
    //Choose which blocks to include in the toolbox.
    Blockly.inject('blocklyDiv', {
        toolbox: defaultToolbox,
        scrollbars: true,
    });
}

function setupOfficialToolbox() {
    Blockly.inject('blocklyDiv', {
        toolbox: officialtoolbox,
        scrollbars: true,
    });
}

/* 
//Custom renderer:
class CustomRenderer extends Blockly.blockRendering.Renderer {
    constructor() {
        super();
    }
}

Blockly.blockRendering.register('custom_renderer', CustomRenderer); */
