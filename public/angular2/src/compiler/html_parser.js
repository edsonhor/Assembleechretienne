'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var html_ast_1 = require('./html_ast');
var di_1 = require('angular2/src/core/di');
var html_lexer_1 = require('./html_lexer');
var parse_util_1 = require('./parse_util');
var html_tags_1 = require('./html_tags');
var HtmlTreeError = (function (_super) {
    __extends(HtmlTreeError, _super);
    function HtmlTreeError(elementName, location, msg) {
        _super.call(this, location, msg);
        this.elementName = elementName;
    }
    HtmlTreeError.create = function (elementName, location, msg) {
        return new HtmlTreeError(elementName, location, msg);
    };
    return HtmlTreeError;
})(parse_util_1.ParseError);
exports.HtmlTreeError = HtmlTreeError;
var HtmlParseTreeResult = (function () {
    function HtmlParseTreeResult(rootNodes, errors) {
        this.rootNodes = rootNodes;
        this.errors = errors;
    }
    return HtmlParseTreeResult;
})();
exports.HtmlParseTreeResult = HtmlParseTreeResult;
var HtmlParser = (function () {
    function HtmlParser() {
    }
    HtmlParser.prototype.parse = function (sourceContent, sourceUrl) {
        var tokensAndErrors = html_lexer_1.tokenizeHtml(sourceContent, sourceUrl);
        var treeAndErrors = new TreeBuilder(tokensAndErrors.tokens).build();
        return new HtmlParseTreeResult(treeAndErrors.rootNodes, tokensAndErrors.errors
            .concat(treeAndErrors.errors));
    };
    HtmlParser = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], HtmlParser);
    return HtmlParser;
})();
exports.HtmlParser = HtmlParser;
var TreeBuilder = (function () {
    function TreeBuilder(tokens) {
        this.tokens = tokens;
        this.index = -1;
        this.rootNodes = [];
        this.errors = [];
        this.elementStack = [];
        this._advance();
    }
    TreeBuilder.prototype.build = function () {
        while (this.peek.type !== html_lexer_1.HtmlTokenType.EOF) {
            if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_OPEN_START) {
                this._consumeStartTag(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_CLOSE) {
                this._consumeEndTag(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.CDATA_START) {
                this._closeVoidElement();
                this._consumeCdata(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.COMMENT_START) {
                this._closeVoidElement();
                this._consumeComment(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.TEXT ||
                this.peek.type === html_lexer_1.HtmlTokenType.RAW_TEXT ||
                this.peek.type === html_lexer_1.HtmlTokenType.ESCAPABLE_RAW_TEXT) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
        return new HtmlParseTreeResult(this.rootNodes, this.errors);
    };
    TreeBuilder.prototype._advance = function () {
        var prev = this.peek;
        if (this.index < this.tokens.length - 1) {
            // Note: there is always an EOF token at the end
            this.index++;
        }
        this.peek = this.tokens[this.index];
        return prev;
    };
    TreeBuilder.prototype._advanceIf = function (type) {
        if (this.peek.type === type) {
            return this._advance();
        }
        return null;
    };
    TreeBuilder.prototype._consumeCdata = function (startToken) {
        this._consumeText(this._advance());
        this._advanceIf(html_lexer_1.HtmlTokenType.CDATA_END);
    };
    TreeBuilder.prototype._consumeComment = function (startToken) {
        this._advanceIf(html_lexer_1.HtmlTokenType.RAW_TEXT);
        this._advanceIf(html_lexer_1.HtmlTokenType.COMMENT_END);
    };
    TreeBuilder.prototype._consumeText = function (token) {
        var text = token.parts[0];
        if (text.length > 0 && text[0] == '\n') {
            var parent_1 = this._getParentElement();
            if (lang_1.isPresent(parent_1) && parent_1.children.length == 0 &&
                html_tags_1.getHtmlTagDefinition(parent_1.name).ignoreFirstLf) {
                text = text.substring(1);
            }
        }
        if (text.length > 0) {
            this._addToParent(new html_ast_1.HtmlTextAst(text, token.sourceSpan));
        }
    };
    TreeBuilder.prototype._closeVoidElement = function () {
        if (this.elementStack.length > 0) {
            var el = collection_1.ListWrapper.last(this.elementStack);
            if (html_tags_1.getHtmlTagDefinition(el.name).isVoid) {
                this.elementStack.pop();
            }
        }
    };
    TreeBuilder.prototype._consumeStartTag = function (startTagToken) {
        var prefix = startTagToken.parts[0];
        var name = startTagToken.parts[1];
        var attrs = [];
        while (this.peek.type === html_lexer_1.HtmlTokenType.ATTR_NAME) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        var fullName = getElementFullName(prefix, name, this._getParentElement());
        var selfClosing = false;
        // Note: There could have been a tokenizer error
        // so that we don't get a token for the end tag...
        if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_OPEN_END_VOID) {
            this._advance();
            selfClosing = true;
            if (html_tags_1.getNsPrefix(fullName) == null && !html_tags_1.getHtmlTagDefinition(fullName).isVoid) {
                this.errors.push(HtmlTreeError.create(fullName, startTagToken.sourceSpan.start, "Only void and foreign elements can be self closed \"" + startTagToken.parts[1] + "\""));
            }
        }
        else if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_OPEN_END) {
            this._advance();
            selfClosing = false;
        }
        var end = this.peek.sourceSpan.start;
        var el = new html_ast_1.HtmlElementAst(fullName, attrs, [], new parse_util_1.ParseSourceSpan(startTagToken.sourceSpan.start, end));
        this._pushElement(el);
        if (selfClosing) {
            this._popElement(fullName);
        }
    };
    TreeBuilder.prototype._pushElement = function (el) {
        if (this.elementStack.length > 0) {
            var parentEl = collection_1.ListWrapper.last(this.elementStack);
            if (html_tags_1.getHtmlTagDefinition(parentEl.name).isClosedByChild(el.name)) {
                this.elementStack.pop();
            }
        }
        var tagDef = html_tags_1.getHtmlTagDefinition(el.name);
        var parentEl = this._getParentElement();
        if (tagDef.requireExtraParent(lang_1.isPresent(parentEl) ? parentEl.name : null)) {
            var newParent = new html_ast_1.HtmlElementAst(tagDef.parentToAdd, [], [el], el.sourceSpan);
            this._addToParent(newParent);
            this.elementStack.push(newParent);
            this.elementStack.push(el);
        }
        else {
            this._addToParent(el);
            this.elementStack.push(el);
        }
    };
    TreeBuilder.prototype._consumeEndTag = function (endTagToken) {
        var fullName = getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
        if (html_tags_1.getHtmlTagDefinition(fullName).isVoid) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan.start, "Void elements do not have end tags \"" + endTagToken.parts[1] + "\""));
        }
        else if (!this._popElement(fullName)) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan.start, "Unexpected closing tag \"" + endTagToken.parts[1] + "\""));
        }
    };
    TreeBuilder.prototype._popElement = function (fullName) {
        for (var stackIndex = this.elementStack.length - 1; stackIndex >= 0; stackIndex--) {
            var el = this.elementStack[stackIndex];
            if (el.name == fullName) {
                collection_1.ListWrapper.splice(this.elementStack, stackIndex, this.elementStack.length - stackIndex);
                return true;
            }
            if (!html_tags_1.getHtmlTagDefinition(el.name).closedByParent) {
                return false;
            }
        }
        return false;
    };
    TreeBuilder.prototype._consumeAttr = function (attrName) {
        var fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
        var end = attrName.sourceSpan.end;
        var value = '';
        if (this.peek.type === html_lexer_1.HtmlTokenType.ATTR_VALUE) {
            var valueToken = this._advance();
            value = valueToken.parts[0];
            end = valueToken.sourceSpan.end;
        }
        return new html_ast_1.HtmlAttrAst(fullName, value, new parse_util_1.ParseSourceSpan(attrName.sourceSpan.start, end));
    };
    TreeBuilder.prototype._getParentElement = function () {
        return this.elementStack.length > 0 ? collection_1.ListWrapper.last(this.elementStack) : null;
    };
    TreeBuilder.prototype._addToParent = function (node) {
        var parent = this._getParentElement();
        if (lang_1.isPresent(parent)) {
            parent.children.push(node);
        }
        else {
            this.rootNodes.push(node);
        }
    };
    return TreeBuilder;
})();
function mergeNsAndName(prefix, localName) {
    return lang_1.isPresent(prefix) ? "@" + prefix + ":" + localName : localName;
}
function getElementFullName(prefix, localName, parentElement) {
    if (lang_1.isBlank(prefix)) {
        prefix = html_tags_1.getHtmlTagDefinition(localName).implicitNamespacePrefix;
        if (lang_1.isBlank(prefix) && lang_1.isPresent(parentElement)) {
            prefix = html_tags_1.getNsPrefix(parentElement.name);
        }
    }
    return mergeNsAndName(prefix, localName);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOlsiSHRtbFRyZWVFcnJvciIsIkh0bWxUcmVlRXJyb3IuY29uc3RydWN0b3IiLCJIdG1sVHJlZUVycm9yLmNyZWF0ZSIsIkh0bWxQYXJzZVRyZWVSZXN1bHQiLCJIdG1sUGFyc2VUcmVlUmVzdWx0LmNvbnN0cnVjdG9yIiwiSHRtbFBhcnNlciIsIkh0bWxQYXJzZXIuY29uc3RydWN0b3IiLCJIdG1sUGFyc2VyLnBhcnNlIiwiVHJlZUJ1aWxkZXIiLCJUcmVlQnVpbGRlci5jb25zdHJ1Y3RvciIsIlRyZWVCdWlsZGVyLmJ1aWxkIiwiVHJlZUJ1aWxkZXIuX2FkdmFuY2UiLCJUcmVlQnVpbGRlci5fYWR2YW5jZUlmIiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVDZGF0YSIsIlRyZWVCdWlsZGVyLl9jb25zdW1lQ29tbWVudCIsIlRyZWVCdWlsZGVyLl9jb25zdW1lVGV4dCIsIlRyZWVCdWlsZGVyLl9jbG9zZVZvaWRFbGVtZW50IiwiVHJlZUJ1aWxkZXIuX2NvbnN1bWVTdGFydFRhZyIsIlRyZWVCdWlsZGVyLl9wdXNoRWxlbWVudCIsIlRyZWVCdWlsZGVyLl9jb25zdW1lRW5kVGFnIiwiVHJlZUJ1aWxkZXIuX3BvcEVsZW1lbnQiLCJUcmVlQnVpbGRlci5fY29uc3VtZUF0dHIiLCJUcmVlQnVpbGRlci5fZ2V0UGFyZW50RWxlbWVudCIsIlRyZWVCdWlsZGVyLl9hZGRUb1BhcmVudCIsIm1lcmdlTnNBbmROYW1lIiwiZ2V0RWxlbWVudEZ1bGxOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQVNPLDBCQUEwQixDQUFDLENBQUE7QUFFbEMsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFFM0QseUJBQWdFLFlBQVksQ0FBQyxDQUFBO0FBRTdFLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FB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QUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUMzQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7QUFDM0NBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBTdHJpbmdXcmFwcGVyLFxuICBzdHJpbmdpZnksXG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBTdHJpbmdKb2luZXIsXG4gIHNlcmlhbGl6ZUVudW0sXG4gIENPTlNUX0VYUFJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtIdG1sQXN0LCBIdG1sQXR0ckFzdCwgSHRtbFRleHRBc3QsIEh0bWxFbGVtZW50QXN0fSBmcm9tICcuL2h0bWxfYXN0JztcblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0h0bWxUb2tlbiwgSHRtbFRva2VuVHlwZSwgdG9rZW5pemVIdG1sfSBmcm9tICcuL2h0bWxfbGV4ZXInO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9uLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0h0bWxUYWdEZWZpbml0aW9uLCBnZXRIdG1sVGFnRGVmaW5pdGlvbiwgZ2V0TnNQcmVmaXh9IGZyb20gJy4vaHRtbF90YWdzJztcblxuZXhwb3J0IGNsYXNzIEh0bWxUcmVlRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgc3RhdGljIGNyZWF0ZShlbGVtZW50TmFtZTogc3RyaW5nLCBsb2NhdGlvbjogUGFyc2VMb2NhdGlvbiwgbXNnOiBzdHJpbmcpOiBIdG1sVHJlZUVycm9yIHtcbiAgICByZXR1cm4gbmV3IEh0bWxUcmVlRXJyb3IoZWxlbWVudE5hbWUsIGxvY2F0aW9uLCBtc2cpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnROYW1lOiBzdHJpbmcsIGxvY2F0aW9uOiBQYXJzZUxvY2F0aW9uLCBtc2c6IHN0cmluZykge1xuICAgIHN1cGVyKGxvY2F0aW9uLCBtc2cpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdG1sUGFyc2VUcmVlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHJvb3ROb2RlczogSHRtbEFzdFtdLCBwdWJsaWMgZXJyb3JzOiBQYXJzZUVycm9yW10pIHt9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdG1sUGFyc2VyIHtcbiAgcGFyc2Uoc291cmNlQ29udGVudDogc3RyaW5nLCBzb3VyY2VVcmw6IHN0cmluZyk6IEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICAgIHZhciB0b2tlbnNBbmRFcnJvcnMgPSB0b2tlbml6ZUh0bWwoc291cmNlQ29udGVudCwgc291cmNlVXJsKTtcbiAgICB2YXIgdHJlZUFuZEVycm9ycyA9IG5ldyBUcmVlQnVpbGRlcih0b2tlbnNBbmRFcnJvcnMudG9rZW5zKS5idWlsZCgpO1xuICAgIHJldHVybiBuZXcgSHRtbFBhcnNlVHJlZVJlc3VsdCh0cmVlQW5kRXJyb3JzLnJvb3ROb2RlcywgKDxQYXJzZUVycm9yW10+dG9rZW5zQW5kRXJyb3JzLmVycm9ycylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHRyZWVBbmRFcnJvcnMuZXJyb3JzKSk7XG4gIH1cbn1cblxuY2xhc3MgVHJlZUJ1aWxkZXIge1xuICBwcml2YXRlIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgcHJpdmF0ZSBwZWVrOiBIdG1sVG9rZW47XG5cbiAgcHJpdmF0ZSByb290Tm9kZXM6IEh0bWxBc3RbXSA9IFtdO1xuICBwcml2YXRlIGVycm9yczogSHRtbFRyZWVFcnJvcltdID0gW107XG5cbiAgcHJpdmF0ZSBlbGVtZW50U3RhY2s6IEh0bWxFbGVtZW50QXN0W10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRva2VuczogSHRtbFRva2VuW10pIHsgdGhpcy5fYWR2YW5jZSgpOyB9XG5cbiAgYnVpbGQoKTogSHRtbFBhcnNlVHJlZVJlc3VsdCB7XG4gICAgd2hpbGUgKHRoaXMucGVlay50eXBlICE9PSBIdG1sVG9rZW5UeXBlLkVPRikge1xuICAgICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVTdGFydFRhZyh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5UQUdfQ0xPU0UpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZUVuZFRhZyh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5DREFUQV9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVDZGF0YSh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5DT01NRU5UX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZUNvbW1lbnQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuVEVYVCB8fFxuICAgICAgICAgICAgICAgICB0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5SQVdfVEVYVCB8fFxuICAgICAgICAgICAgICAgICB0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5FU0NBUEFCTEVfUkFXX1RFWFQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2tpcCBhbGwgb3RoZXIgdG9rZW5zLi4uXG4gICAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIdG1sUGFyc2VUcmVlUmVzdWx0KHRoaXMucm9vdE5vZGVzLCB0aGlzLmVycm9ycyk7XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlKCk6IEh0bWxUb2tlbiB7XG4gICAgdmFyIHByZXYgPSB0aGlzLnBlZWs7XG4gICAgaWYgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggLSAxKSB7XG4gICAgICAvLyBOb3RlOiB0aGVyZSBpcyBhbHdheXMgYW4gRU9GIHRva2VuIGF0IHRoZSBlbmRcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG4gICAgdGhpcy5wZWVrID0gdGhpcy50b2tlbnNbdGhpcy5pbmRleF07XG4gICAgcmV0dXJuIHByZXY7XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlSWYodHlwZTogSHRtbFRva2VuVHlwZSk6IEh0bWxUb2tlbiB7XG4gICAgaWYgKHRoaXMucGVlay50eXBlID09PSB0eXBlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWR2YW5jZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDZGF0YShzdGFydFRva2VuOiBIdG1sVG9rZW4pIHtcbiAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgIHRoaXMuX2FkdmFuY2VJZihIdG1sVG9rZW5UeXBlLkNEQVRBX0VORCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ29tbWVudChzdGFydFRva2VuOiBIdG1sVG9rZW4pIHtcbiAgICB0aGlzLl9hZHZhbmNlSWYoSHRtbFRva2VuVHlwZS5SQVdfVEVYVCk7XG4gICAgdGhpcy5fYWR2YW5jZUlmKEh0bWxUb2tlblR5cGUuQ09NTUVOVF9FTkQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRleHQodG9rZW46IEh0bWxUb2tlbikge1xuICAgIGxldCB0ZXh0ID0gdG9rZW4ucGFydHNbMF07XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMCAmJiB0ZXh0WzBdID09ICdcXG4nKSB7XG4gICAgICBsZXQgcGFyZW50ID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgICAgaWYgKGlzUHJlc2VudChwYXJlbnQpICYmIHBhcmVudC5jaGlsZHJlbi5sZW5ndGggPT0gMCAmJlxuICAgICAgICAgIGdldEh0bWxUYWdEZWZpbml0aW9uKHBhcmVudC5uYW1lKS5pZ25vcmVGaXJzdExmKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9hZGRUb1BhcmVudChuZXcgSHRtbFRleHRBc3QodGV4dCwgdG9rZW4uc291cmNlU3BhbikpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2Nsb3NlVm9pZEVsZW1lbnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBlbCA9IExpc3RXcmFwcGVyLmxhc3QodGhpcy5lbGVtZW50U3RhY2spO1xuXG4gICAgICBpZiAoZ2V0SHRtbFRhZ0RlZmluaXRpb24oZWwubmFtZSkuaXNWb2lkKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudFN0YWNrLnBvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVTdGFydFRhZyhzdGFydFRhZ1Rva2VuOiBIdG1sVG9rZW4pIHtcbiAgICB2YXIgcHJlZml4ID0gc3RhcnRUYWdUb2tlbi5wYXJ0c1swXTtcbiAgICB2YXIgbmFtZSA9IHN0YXJ0VGFnVG9rZW4ucGFydHNbMV07XG4gICAgdmFyIGF0dHJzID0gW107XG4gICAgd2hpbGUgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkFUVFJfTkFNRSkge1xuICAgICAgYXR0cnMucHVzaCh0aGlzLl9jb25zdW1lQXR0cih0aGlzLl9hZHZhbmNlKCkpKTtcbiAgICB9XG4gICAgdmFyIGZ1bGxOYW1lID0gZ2V0RWxlbWVudEZ1bGxOYW1lKHByZWZpeCwgbmFtZSwgdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpKTtcbiAgICB2YXIgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICAvLyBOb3RlOiBUaGVyZSBjb3VsZCBoYXZlIGJlZW4gYSB0b2tlbml6ZXIgZXJyb3JcbiAgICAvLyBzbyB0aGF0IHdlIGRvbid0IGdldCBhIHRva2VuIGZvciB0aGUgZW5kIHRhZy4uLlxuICAgIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9FTkRfVk9JRCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSB0cnVlO1xuICAgICAgaWYgKGdldE5zUHJlZml4KGZ1bGxOYW1lKSA9PSBudWxsICYmICFnZXRIdG1sVGFnRGVmaW5pdGlvbihmdWxsTmFtZSkuaXNWb2lkKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzLnB1c2goSHRtbFRyZWVFcnJvci5jcmVhdGUoXG4gICAgICAgICAgICBmdWxsTmFtZSwgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgICAgICAgYE9ubHkgdm9pZCBhbmQgZm9yZWlnbiBlbGVtZW50cyBjYW4gYmUgc2VsZiBjbG9zZWQgXCIke3N0YXJ0VGFnVG9rZW4ucGFydHNbMV19XCJgKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9FTkQpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHNlbGZDbG9zaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBlbmQgPSB0aGlzLnBlZWsuc291cmNlU3Bhbi5zdGFydDtcbiAgICB2YXIgZWwgPSBuZXcgSHRtbEVsZW1lbnRBc3QoZnVsbE5hbWUsIGF0dHJzLCBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCkpO1xuICAgIHRoaXMuX3B1c2hFbGVtZW50KGVsKTtcbiAgICBpZiAoc2VsZkNsb3NpbmcpIHtcbiAgICAgIHRoaXMuX3BvcEVsZW1lbnQoZnVsbE5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3B1c2hFbGVtZW50KGVsOiBIdG1sRWxlbWVudEFzdCkge1xuICAgIGlmICh0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgcGFyZW50RWwgPSBMaXN0V3JhcHBlci5sYXN0KHRoaXMuZWxlbWVudFN0YWNrKTtcbiAgICAgIGlmIChnZXRIdG1sVGFnRGVmaW5pdGlvbihwYXJlbnRFbC5uYW1lKS5pc0Nsb3NlZEJ5Q2hpbGQoZWwubmFtZSkpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50U3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRhZ0RlZiA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGVsLm5hbWUpO1xuICAgIHZhciBwYXJlbnRFbCA9IHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKTtcbiAgICBpZiAodGFnRGVmLnJlcXVpcmVFeHRyYVBhcmVudChpc1ByZXNlbnQocGFyZW50RWwpID8gcGFyZW50RWwubmFtZSA6IG51bGwpKSB7XG4gICAgICB2YXIgbmV3UGFyZW50ID0gbmV3IEh0bWxFbGVtZW50QXN0KHRhZ0RlZi5wYXJlbnRUb0FkZCwgW10sIFtlbF0sIGVsLnNvdXJjZVNwYW4pO1xuICAgICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3UGFyZW50KTtcbiAgICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2gobmV3UGFyZW50KTtcbiAgICAgIHRoaXMuZWxlbWVudFN0YWNrLnB1c2goZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hZGRUb1BhcmVudChlbCk7XG4gICAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKGVsKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRW5kVGFnKGVuZFRhZ1Rva2VuOiBIdG1sVG9rZW4pIHtcbiAgICB2YXIgZnVsbE5hbWUgPVxuICAgICAgICBnZXRFbGVtZW50RnVsbE5hbWUoZW5kVGFnVG9rZW4ucGFydHNbMF0sIGVuZFRhZ1Rva2VuLnBhcnRzWzFdLCB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCkpO1xuXG4gICAgaWYgKGdldEh0bWxUYWdEZWZpbml0aW9uKGZ1bGxOYW1lKS5pc1ZvaWQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgSHRtbFRyZWVFcnJvci5jcmVhdGUoZnVsbE5hbWUsIGVuZFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFZvaWQgZWxlbWVudHMgZG8gbm90IGhhdmUgZW5kIHRhZ3MgXCIke2VuZFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCkpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuX3BvcEVsZW1lbnQoZnVsbE5hbWUpKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKEh0bWxUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBjbG9zaW5nIHRhZyBcIiR7ZW5kVGFnVG9rZW4ucGFydHNbMV19XCJgKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcG9wRWxlbWVudChmdWxsTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgc3RhY2tJbmRleCA9IHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCAtIDE7IHN0YWNrSW5kZXggPj0gMDsgc3RhY2tJbmRleC0tKSB7XG4gICAgICBsZXQgZWwgPSB0aGlzLmVsZW1lbnRTdGFja1tzdGFja0luZGV4XTtcbiAgICAgIGlmIChlbC5uYW1lID09IGZ1bGxOYW1lKSB7XG4gICAgICAgIExpc3RXcmFwcGVyLnNwbGljZSh0aGlzLmVsZW1lbnRTdGFjaywgc3RhY2tJbmRleCwgdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoIC0gc3RhY2tJbmRleCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWdldEh0bWxUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmNsb3NlZEJ5UGFyZW50KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUF0dHIoYXR0ck5hbWU6IEh0bWxUb2tlbik6IEh0bWxBdHRyQXN0IHtcbiAgICB2YXIgZnVsbE5hbWUgPSBtZXJnZU5zQW5kTmFtZShhdHRyTmFtZS5wYXJ0c1swXSwgYXR0ck5hbWUucGFydHNbMV0pO1xuICAgIHZhciBlbmQgPSBhdHRyTmFtZS5zb3VyY2VTcGFuLmVuZDtcbiAgICB2YXIgdmFsdWUgPSAnJztcbiAgICBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQVRUUl9WQUxVRSkge1xuICAgICAgdmFyIHZhbHVlVG9rZW4gPSB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICB2YWx1ZSA9IHZhbHVlVG9rZW4ucGFydHNbMF07XG4gICAgICBlbmQgPSB2YWx1ZVRva2VuLnNvdXJjZVNwYW4uZW5kO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEh0bWxBdHRyQXN0KGZ1bGxOYW1lLCB2YWx1ZSwgbmV3IFBhcnNlU291cmNlU3BhbihhdHRyTmFtZS5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhcmVudEVsZW1lbnQoKTogSHRtbEVsZW1lbnRBc3Qge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggPiAwID8gTGlzdFdyYXBwZXIubGFzdCh0aGlzLmVsZW1lbnRTdGFjaykgOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkVG9QYXJlbnQobm9kZTogSHRtbEFzdCkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCk7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb290Tm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2VOc0FuZE5hbWUocHJlZml4OiBzdHJpbmcsIGxvY2FsTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzUHJlc2VudChwcmVmaXgpID8gYEAke3ByZWZpeH06JHtsb2NhbE5hbWV9YCA6IGxvY2FsTmFtZTtcbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudEZ1bGxOYW1lKHByZWZpeDogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRFbGVtZW50OiBIdG1sRWxlbWVudEFzdCk6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKHByZWZpeCkpIHtcbiAgICBwcmVmaXggPSBnZXRIdG1sVGFnRGVmaW5pdGlvbihsb2NhbE5hbWUpLmltcGxpY2l0TmFtZXNwYWNlUHJlZml4O1xuICAgIGlmIChpc0JsYW5rKHByZWZpeCkgJiYgaXNQcmVzZW50KHBhcmVudEVsZW1lbnQpKSB7XG4gICAgICBwcmVmaXggPSBnZXROc1ByZWZpeChwYXJlbnRFbGVtZW50Lm5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtZXJnZU5zQW5kTmFtZShwcmVmaXgsIGxvY2FsTmFtZSk7XG59XG4iXX0=