'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommentForm = function (_React$Component) {
    _inherits(CommentForm, _React$Component);

    function CommentForm(props) {
        _classCallCheck(this, CommentForm);

        var _this = _possibleConstructorReturn(this, (CommentForm.__proto__ || Object.getPrototypeOf(CommentForm)).call(this, props));

        _this.handleAuthorChange = function (e) {
            _this.setState({ author: e.target.value });
        };

        _this.handleTextChange = function (e) {
            _this.setState({ text: e.target.value });
        };

        _this.handleSubmit = function (e) {
            e.preventDefault();
            var author = _this.state.author.trim();
            var text = _this.state.text.trim();
            if (!text || !author) {
                return;
            }
            _this.props.onCommentSubmit({ author: author, text: text });
            _this.setState({ author: '', text: '' });
        };

        _this.state = {
            author: '',
            text: ''
        };
        return _this;
    }

    _createClass(CommentForm, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'form',
                { className: 'commentForm', onSubmit: this.handleSubmit },
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Your name',
                    value: this.state.author,
                    onChange: this.handleAuthorChange
                }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Say something...',
                    value: this.state.text,
                    onChange: this.handleTextChange
                }),
                React.createElement('input', { type: 'submit', value: 'Post' })
            );
        }
    }]);

    return CommentForm;
}(React.Component);

;