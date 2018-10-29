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
    }
    catch (e) {
        $('body').append($('<p/>').text(e));
    }

})();

