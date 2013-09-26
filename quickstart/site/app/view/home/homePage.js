define([
    'jquery',
    'cajetaHtml5',
    'formExampleDiv',
    'uiExampleDiv',
    'serverInteractionDiv',
    'text!app/view/home/homePage.html'
], function($, Cajeta, formExampleDiv, uiExampleDiv, serverInteractionDiv, homePageText) {
    
    // Create an alias for shortening namespace.
    var Html5 = Cajeta.view.html5;

    var homePage = new Cajeta.view.Page({ cid: Cajeta.homePage });
    homePage.setTemplate('homePage', homePageText);

    var tabs = new Html5.TabList({ cid: 'tabs', contentId: 'content' });
    tabs.addChild({ title: 'Html5 Form Example', component: formExampleDiv });
    tabs.addChild({ title: 'UI Examples', component: uiExampleDiv });
    tabs.addChild({ title: 'Server Interaction Example', component: serverInteractionDiv });
    homePage.addChild(tabs);

    return homePage;
});
