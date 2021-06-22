import {Router} from '../../Router';
import {Session, Page, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './EditorPage.ejs';
import Placeholder from './Placeholder.ejs';

Router.on('/editor', ({data, params, queryString}) => {

    if(!params.file) {
        Notify('error', 'No path given');
        return Router.back();
    }
    Page.setContent(Placeholder());

    var path = params.file;

    Util.ajaxReq({
        type: 'get',
        url: 'api/editor/getfile',
        content: 'path=' + path,
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            data = JSON.parse(data).data;
            var content = data.content;

            Util.loadCSS('/assets/codemirror/lib/codemirror.css');
            Util.loadScript('/assets/codemirror/lib/codemirror.js', () => {
                Util.loadScript('/assets/codemirror/mode/yaml/yaml.js', () => {
                    Page.setContent(Template({
                        name: data.name
                    }));
    
                    // Create the editor
                    var cm = window.CodeMirror(Util._('editor'), {
                        value: content,
                        mode:  "yaml",
                        lineNumbers: true
                    });
    
                    // Save button behaviour
                    Util._('saveBtn').onclick = (evt) => {
    
                        var el = evt.currentTarget;
                        var data = cm.getValue();
                        var html = el.innerHTML;
                        el.innerHTML = "<span class='fa fa-spin fa-sync'></span> Saving changes...";
                        el.classList.add("disabled");
    
                        Util.ajaxReq({
                            type: 'post',
                            url: '/api/editor/setfile',
                            content: {
                                content: data,
                                path: path
                            },
                            headers: [{
                                header: 'Authorization',
                                content: 'Basic ' + Session.token
                            }],
                            onload: (data) => {
                                Notify('success', 'Saved changes successfully');
                                el.innerHTML = html;
                                el.classList.remove('disabled');
                            },
                            onerror: (data) => {
                                Notify('failure', 'Failed to edit file: ' + data);
                            }
                        });
    
                    };

                    Util._('cancelBtn').onclick = Router.back;
                });
            });
        },
        onerror: function(err) {
            Notify('failure', 'Failed to fetch file: ' + err);
        }
    });

});