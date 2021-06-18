import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify, Confirm} from '../../UI';
import AddPluginPage from './AddPluginPage.ejs';
import ManagePluginsPage from './ManagePluginsPage.ejs';
import Placeholder from './Placeholder.ejs';

var goBack = () => {
    if(window.history.length > 2) window.history.back();
    else Router.navigate('/');
};

Router.on('/plugins/install', () => {
    Page.setContent(Placeholder());
    Page.setContent(AddPluginPage());

    Util._('addPlugin.submit').onclick = () => {
        var loader = Util.setLoadingBtn(Util._('addPlugin.submit'), 'Installing Plugin');
        Util.submitForm(Util._('addPlugin.form'), '/api/plugins/install', (data) => {
            Notify('success', 'Plugin installed successfully');
            loader.restore();
        }, (err) => {
            Notify('error', err);
            loader.restore();
        });
    };
});

Router.on('/plugins/manage/:type', ({data}) => {
    Page.setContent(Placeholder());

    Util.ajaxReq({
        url: '/api/plugins/get',
        type: 'get',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: (resp) => {
            resp = JSON.parse(JSON.parse(resp).plugins);
            Page.setContent(ManagePluginsPage({
                plugins: resp,
                type: data.type
            }));
        },
        onerror: (resp) => {
            Notify('error', resp);
        }
    });
});

Router.on('/plugins/enable/:plugin', ({data}) => {
    var plugin = decodeURIComponent(data.plugin);
    Util.ajaxReq({
        type: 'post',
        url: '/api/plugins/enable',
        content: {
            plugin: plugin
        },
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            Notify('success', 'Plugin was enabled successfully');
            goBack();
        },
        onerror: function(err) {
            Notify('failure', 'Failed to enable plugin: ' + err);
            goBack();
        }
    });
});

Router.on('/plugins/disable/:plugin', ({data}) => {
    var plugin = decodeURIComponent(data.plugin);
    Util.ajaxReq({
        type: 'post',
        url: '/api/plugins/disable',
        content: {
            plugin: plugin
        },
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: function(data) {
            Notify('success', 'Plugin was disabled successfully');
            goBack();
        },
        onerror: function(err) {
            Notify('failure', 'Failed to disable plugin: ' + err);
            goBack();
        }
    });
});

Router.on('/plugins/delete/:plugin', ({data}) => {
    var plugin = decodeURIComponent(data.plugin);
    Confirm('Confirm delete', 'Are you sure you want to delete the plugin "' + plugin + '"?', (state) => {
        if(state == true) {
            Util.ajaxReq({
                type: 'post',
                url: '/api/plugins/delete',
                content: {
                    plugin: plugin
                },
                headers: [{
                    header: 'Authorization',
                    content: 'Basic ' + Session.token
                }],
                onload: function(data) {
                    Notify('success', 'Plugin was deleted successfully');
                    goBack();
                },
                onerror: function(err) {
                    Notify('failure', 'Failed to delete plugin: ' + err);
                    goBack();
                }
            });
        }else {
            goBack();
        }
    });
});