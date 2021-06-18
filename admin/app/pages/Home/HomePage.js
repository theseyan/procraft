import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import Template from './HomePage.ejs';
import Placeholder from './Placeholder.ejs';
import {SocketService} from '../../services/SocketService';
import {Notify} from '../../UI';

Router.on('/', () => {
    Page.setContent(Placeholder());

    var listenEvents = ['SERVER_STARTED', 'SERVER_EXITED', 'SERVER_STARTING', 'PLAYER_CHANGE'];

    var setListeners = () => {
        var actionBtnPress = (action) => {
            Util.ajaxReq({
                url: '/api/server/' + action,
                type: 'post',
                content: {},
                headers: [{
                    header: 'Authorization',
                    content: 'Basic ' + Session.token
                }],
                onload: (resp) => {
                    resp = JSON.parse(resp);
                    Notify('success', resp.message);
                },
                onerror: (resp) => {
                    Notify('error', resp);
                }
            });
        };

        Util._('btn.startServer').onclick = () => {actionBtnPress('start');};
        Util._('btn.stopServer').onclick = () => {actionBtnPress('stop');};
        Util._('btn.killServer').onclick = () => {actionBtnPress('kill');};
        Util._('btn.restartServer').onclick = () => {actionBtnPress('restart');};
    };

    Page.events.push(SocketService.events.on('event', (data) => {
        if(listenEvents.indexOf(data.event) == -1) return;
        Page.setContent(Template({
            systemStatus: data.data
        }));
        setListeners();
    }));

    Util.ajaxReq({
        url: '/api/system/status',
        type: 'get',
        content: '',
        headers: [{
            header: 'Authorization',
            content: 'Basic ' + Session.token
        }],
        onload: (resp) => {
            resp = JSON.parse(resp);
            Page.setContent(Template({
                systemStatus: resp
            }));
            setListeners();
        },
        onerror: (resp) => {
            Notify('error', resp);
        }
    });

});