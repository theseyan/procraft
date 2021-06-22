import {Router} from '../../Router';
import {EventListener, Page, Session, Util} from '../../Core';
import {Notify, Confirm} from '../../UI';
import Template from './FileManagerPage.ejs';
import Placeholder from './Placeholder.ejs';

var getFiles = (path, cb) => {
    Util.ajaxReq({
        type: 'get',
        url: '/api/filemanager/getfiles',
        content: 'path=' + path,
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: (data) => {
            data = JSON.parse(data);
            cb(JSON.parse(data.files));
        },
        onerror: (data) => {
            Notify('failure', 'Failed to fetch files: ' + data);
        }
    });
};

Router.on('/filemanager', ({data, params, queryString}) => {
    Page.setContent(Placeholder());

    var route = '/';
    if(params && params.path) route = decodeURIComponent(params.path);

    if(route != '/' && route.endsWith('/')) route = route.substring(0, route.length-1);
    var routes = route.split('/');

    routes.shift();
    if(routes[routes.length-1] == "") routes.pop();

    getFiles(route, (data) => {
        var folders = [];
        for(var i=0; i<=data.length-1; i++) {
            if(data[i].dir && data[i].dir == true) {
                folders.push(data.splice(i, 1));
                i--;
            }
        }
        console.log(routes);
        Page.setContent(Template({
            files: data,
            folders: folders,
            route: route,
            routes: routes
        }));
    });

    EventListener.on("click", window, (event) => {

        // File Upload button
        if(event.target.id === "fileUploadBtn") {

            Util._('fileUploadInput').click();
            Util._('fileUploadInput').onchange = (evt) => {
                if(Util._('fileUploadInput').files.length < 1) return;
                
                var html = event.target.innerHTML;
                event.target.classList.add('disabled');
                event.target.innerHTML = "<span class='fa fa-spin fa-circle-notch'></span> Uploading file...";
    
                Util._('fileUploadPath').value = route;
                Util.submitForm(Util._('uploadFileForm'), '/api/filemanager/uploadfile', (data) => {
                    event.target.classList.remove('disabled');
                    event.target.innerHTML = html;
    
                    Notify('success', 'Uploaded file successfully');
    
                    Router.reload();
                }, (err) => {
                    Notify('failure', 'Failed to upload file: ' + err);
    
                    event.target.classList.remove('disabled');
                    event.target.innerHTML = html;
                });
            };

        }

        else if(event.target.id === "newFolderBtn") {
            var name = prompt('New Folder Name');
            if(name != '' && name != null) {
                Util.ajaxReq({
                    type: 'post',
                    url: '/api/filemanager/createfolder',
                    content: {
                        path: route,
                        folder: name
                    },
                    headers: [{
                        header: 'Authorization',
                        content: 'Basic ' + Session.token
                    }],
                    onload: (data) => {
                        Notify('success', 'Created folder successfully');
                        Router.reload();
                    },
                    onerror: (data) => {
                        Notify('failure', 'Failed to create folder: ' + data);
                    }
                });
            }
        }

    });

});

Router.on('/filemanager/deletefolder/:path', ({data}) => {
    var path = decodeURIComponent(data.path);
    Confirm('Confirm action', 'Are you sure about deleting the folder "'+path+'"?', (action) => {
        if(action == true) {
            Util.ajaxReq({
                type: 'post',
                url: '/api/filemanager/deletefolder',
                content: {
                    path: path
                },
                headers: [{
                    header: 'Authorization',
                    content: 'Basic ' + Session.token
                }],
                onload: (data) => {
                    Notify('success', 'Deleted folder successfully');
                    Router.back();
                },
                onerror: (data) => {
                    Notify('failure', 'Failed to delete the folder: ' + data);
                    Router.back();
                }
            });
        }
    });
});

Router.on('/filemanager/deletefile/:path', ({data}) => {
    var path = decodeURIComponent(data.path);
    Confirm('Confirm action', 'Are you sure about deleting the file "'+path+'"?', (action) => {
        if(action == true) {
            Util.ajaxReq({
                type: 'post',
                url: '/api/filemanager/deletefile',
                content: {
                    path: path
                },
                headers: [{
                    header: 'Authorization',
                    content: 'Basic ' + Session.token
                }],
                onload: (data) => {
                    Notify('success', 'Deleted file successfully');
                    Router.back();
                },
                onerror: (data) => {
                    Notify('failure', 'Failed to delete the file: ' + data);
                    Router.back();
                }
            });
        }
    });
});