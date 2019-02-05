import * as Zation from "zation-client";

(async () => {

    const client = Zation.create({
        hostname : window.location.hostname,
        port : parseInt(window.location.port),
        debug : false
    });

    try {
        await client.connect();

        for(let i = 1; i < 6; i++) {
            $('body').append($('<p/>').text(`Ping ${i}: ${await client.ping()}ms`));
        }

        await client.request()
            .systemController(true)
            .controller('zation/panel/auth')
            .data({userName : 'luca', password : '123'})
            .onSuccessful(() => {alert('yeah');})
            .onError((e) => {alert(JSON.stringify(e));})
            .send();

        await client.subPanelOutCh();

        //await client.panelOutCh().subscribe();

        await client.subAuthUserGroupCh();

        client.channelReact().onPubPanelOutCh(null,(data) => {
            alert(JSON.stringify(data));
        });

        await client.pubPanelInCh('firstPing',{});

    }
    catch (e) {
        $('body').append($('<p/>').text(e));
    }

})();

