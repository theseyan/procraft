import {Router} from '../../Router';
import {Page, Session, Util} from '../../Core';
import {Notify} from '../../UI';
import Template from './CommandLinePage.ejs';
import Placeholder from './Placeholder.ejs';
import {SocketService} from '../../services/SocketService';

var insertLine = (line) => {
    var cmdContent = Util._('cmd.content');
    var scrolled = Math.round(cmdContent.offsetHeight + cmdContent.scrollTop);
    var isBottom = scrolled == cmdContent.scrollHeight || scrolled - cmdContent == 1 || scrolled - cmdContent == -1;

    var node = document.createElement('div');
    node.textContent = line;
    cmdContent.appendChild(node);

    if(isBottom==true) cmdContent.scrollTop = cmdContent.scrollHeight;
};

Router.on('/server/cmd', () => {
    Page.setContent(Placeholder());
    Page.setContent(Template());

    SocketService.startLogStream();
    Page.events.push(SocketService.events.on('cmd_message', (message) => {
        insertLine(message.text);
    }));

    var sendCommand = () => {
        Util.submitForm(Util._('cmd.form'), '/api/server/command', (data) => {}, (err) => {
            Notify('error', err);
        });
        Util._('cmd.input').value = '';
    };
    Util._('cmd.form').onsubmit = (e) => {
        e.preventDefault();
        sendCommand();
    };
}, {
    leave(done, match) {
        SocketService.stopLogStream();
        done();
    }
});