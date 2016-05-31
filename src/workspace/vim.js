'use strict';

goog.provide("Entry.Vim");

Entry.Vim = function(dom, textType) {
    //Definition For Textmode
    Entry.Vim.MAZE_MODE = 0; 
    Entry.Vim.WORKSPACE_MODE = 1; 

    Entry.Vim.TEXT_TYPE_JS = 0;
    Entry.Vim.TEXT_TYPE_PY = 1;

    Entry.Vim.PARSER_TYPE_JS_TO_BLOCK = 0;
    Entry.Vim.PARSER_TYPE_PY_TO_BLOCK = 1;
    Entry.Vim.PARSER_TYPE_BLOCK_TO_JS = 2;
    Entry.Vim.PARSER_TYPE_BLOCK_TO_PY = 3;

    Entry.Vim.PYTHON_IMPORT_ENTRY = "import Entry\n";
    Entry.Vim.PYTHON_IMPORT_HW = "import hw\n";
   


    if (typeof dom === "string")
        dom = $('#' + dom);
    else
        dom = $(dom);

    if (dom.prop("tagName") !== "DIV")
        return console.error("Dom is not div element");

    this.createDom(dom);

    //this._parser = new Entry.Parser("maze", "js", this.codeMirror);
    //this._blockParser = new Entry.Parser("maze", "block");
    this._mode = Entry.Vim.WORKSPACE_MODE;
    this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS;

    this._parser = new Entry.Parser(this._mode, this._parserType, this.codeMirror);
    
    //this._pyBlockParser = new Entry.Parser("ws", "blockPy", this.codeMirror);
    //this._jsParser = new Entry.Parser("ws", "js", this.codeMirror);
    //this._pyParser = new Entry.Parser("ws", "py", this.codeMirror);

    Entry.Model(this, false);
    window.eventset = [];
};

(function(p) {
    p.createDom = function (dom) {
        var parent, _self, target;
        parent = dom;
        this.view = Entry.Dom('div', {
            parent:parent,
            class: 'entryVimBoard'
        });

        this.codeMirror = CodeMirror(this.view[0], {
            lineNumbers: true,
            value: "",
            mode:  {name:"javascript", globalVars: true},
            theme: "default",
            indentUnit: 4,
            styleActiveLine: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Tab": function(cm) {
                    var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
                    cm.replaceSelection(spaces);
                }
            },
            // gutters: ["CodeMirror-lint-markers"],
            lint: true,
            viewportMargin: 10
        });

        this.doc = this.codeMirror.getDoc();

        _self = this;
        target = this.view[0];
        function eventDragEnd(e) {
            var textCode = _self.getCodeToText(e.block);
            _self.codeMirror.display.dragFunctions.leave(e);
            var mousedown = new MouseEvent('mousedown', {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'clientX' : e.clientX,
                'clientY' : e.clientY
            });

            _self.codeMirror.display.scroller.dispatchEvent(mousedown);
            var testArr = textCode.split('\n');
            var max = testArr.length - 1;
            var lastLine = 0;
            testArr.forEach(function (text, i) {
                _self.codeMirror.replaceSelection(text);
                var cursor = _self.doc.getCursor();
                lastLine = cursor.line;
                _self.codeMirror.indentLine(lastLine);
                if(i === 0 || max !== i) {
                    _self.codeMirror.replaceSelection('\n');
                }
            });
        }

        function eventDragOver(e) {
            _self.codeMirror.display.dragFunctions.over(e);
        }

        target.removeEventListener("dragEnd", eventDragEnd);
        target.removeEventListener("dragOver", eventDragOver);
        target.addEventListener('dragEnd', eventDragEnd);
        target.addEventListener('dragOver', eventDragOver);
    };

    p.hide = function() {
        this.view.addClass('entryRemove');
    };

    p.show = function() {
        this.view.removeClass('entryRemove');
    };

    p.textToCode = function() {
        var textType = this.workspace.textType;
        if (textType === Entry.Vim.TEXT_TYPE_JS) {
            this._parserType = Entry.Vim.PARSER_TYPE_JS_TO_BLOCK;
            this._parser.setParser(this._mode, this._parserType, this.codeMirror);
        } else if(textType === Entry.Vim.TEXT_TYPE_PY) {
            this._parserType = Entry.Vim.PARSER_TYPE_PY_TO_BLOCK;
            this._parser.setParser(this._mode, this._parserType, this.codeMirror);
        }

        var textCode = this.codeMirror.getValue();
        var code = this._parser.parse(textCode);
        if(code.length === 0) {   
            throw {
                message : '지원하지 않는 파이썬 코드를 포함하고 있습니다.',
            };
        }
        return code;
    };

    p.codeToText = function(code) {
        var textType = this.workspace.textType;
        if (textType === Entry.Vim.TEXT_TYPE_JS) {
            this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS;
            this._parser.setParser(this._mode, this._parserType, this.codeMirror);
        } else if(textType === Entry.Vim.TEXT_TYPE_PY) {
            this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY;
            this._parser.setParser(this._mode, this._parserType, this.codeMirror);
        } 

        var textCode = this._parser.parse(code);
        textCode = Entry.Vim.PYTHON_IMPORT_ENTRY
        .concat(Entry.Vim.PYTHON_IMPORT_HW)
        .concat("\n")
        .concat(textCode); 

        this.codeMirror.setValue(textCode);
        // this.codeMirror.getDoc().markText({line:0, ch:0}, {line: 1, ch: 100}, {readOnly: true});
    };

    p.getCodeToText = function(code) {
        var textType = this.workspace.textType;
        if (textType === Entry.Vim.TEXT_TYPE_JS){
            this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_JS;
            this._parser.setParser(this._mode, this._parserType, this.codeMirror);
        } else if(textType === Entry.Vim.TEXT_TYPE_PY){
            this._parserType = Entry.Vim.PARSER_TYPE_BLOCK_TO_PY;
            this._parser.setParser(this._mode, this._parserType, this.codeMirror);
        }
        var textCode = this._parser.parse(code);
        return textCode;
    };

})(Entry.Vim.prototype);
