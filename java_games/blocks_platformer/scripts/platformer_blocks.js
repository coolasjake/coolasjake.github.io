
let currentButton;
const codeButtonsTray = document.getElementById("code-buttons-tray")

function createCodeButton(name, parent) {
    let codeButton = document.createElement("div")
    codeButton.classList.add("code-button")
    codeButton.textContent = name
    parent.appendChild(codeButton)
    return codeButton;
}

function runButtonCode(button, context) {
    /* loadWorkspace(button);
    let code = javascript.javascriptGenerator.workspaceToCode(
        Blockly.getMainWorkspace(),
    ); */
    // Eval can be dangerous. For more controlled execution, check
    // https://github.com/NeilFraser/JS-Interpreter.
    try {
        eval(button.blocklyCode);
    } catch (error) {
        console.log(error);
    }
}

function loadWorkspace(button) {
    const workspace = Blockly.getMainWorkspace();
    if (button.blocklySave) {
        Blockly.serialization.workspaces.load(button.blocklySave, workspace);
    } else {
        workspace.clear();
    }
}

function save(button) {
    button.blocklySave = Blockly.serialization.workspaces.save(
        Blockly.getMainWorkspace(),
    );
    button.blocklyCode = javascript.javascriptGenerator.workspaceToCode(
        Blockly.getMainWorkspace(),
    );
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
document.querySelector('#done').addEventListener('click', enablePlayMode);
document.querySelector('#save').addEventListener('click', handleSave);

enablePlayMode();
//enableSelectMode();



// Block Definitions:
function setupBlockly() {
    defineBlocks();
    setupToolbox();
}

function setupToolbox() {
    const toolbox = {
        kind: 'flyoutToolbox',
        contents: [
            /* {
                kind: 'block',
                type: 'controls_repeat_ext',
                inputs: {
                    TIMES: {
                        shadow: {
                            type: 'math_number',
                            fields: {
                                NUM: 5,
                            },
                        },
                    },
                },
            }, */
            {
                kind: 'block',
                type: 'jump',
            },
            {
                kind: 'block',
                type: 'test',
            },
            {
                kind: 'block',
                type: 'test_variable',
            },
        ],
    };

    Blockly.inject('blocklyDiv', {
        toolbox: toolbox,
        scrollbars: true,
    });
}

function defineBlocks() {
    Blockly.defineBlocksWithJsonArray([
        // Block for colour picker.
        {
            type: 'play_sound',
            message0: 'Play %1',
            args0: [
                {
                    type: 'field_dropdown',
                    name: 'VALUE',
                    options: [
                        ['C4', 'sounds/c4.m4a'],
                        ['D4', 'sounds/d4.m4a'],
                        ['E4', 'sounds/e4.m4a'],
                        ['F4', 'sounds/f4.m4a'],
                        ['G4', 'sounds/g4.m4a'],
                    ],
                },
            ],
            previousStatement: null,
            nextStatement: null,
            colour: 355,
        },
        {
            type: "jump",
            message0: "jump %1",
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

    javascript.javascriptGenerator.forBlock['play_sound'] = function (block) {
        const value = "'" + block.getFieldValue('VALUE') + "'";
        return 'MusicMaker.queueSound(' + value + ');\n';
    };

    javascript.javascriptGenerator.forBlock['jump'] = function (block) {
        const value = "'" + block.getFieldValue('speed') + "'";
        return 'context.ySpeed = -' + value + ';\n';
    };

    javascript.javascriptGenerator.forBlock['test'] = function (block) {
        const value = "'" + block.getFieldValue('value') + "'";
        return 'console.log("Test = " + ' + value + ');\n';
    };

    javascript.javascriptGenerator.forBlock['test_variable'] = function (block) {
        const value = block.getFieldValue('variable');
        return 'console.log(context.' + value + ');\n';
    };
}