// ==UserScript==
// @name         Gaia Mod - Mod++
// @version      1.1.1
// @description  Provides and upgraded toolset to enhance the mod experience.
// @author       Watervoir (http://www.gaiaonline.com/p/watervoir)
// @include      http://*.gaiaonline.com/*
// @include      https://*.gaiaonline.com/*
// @require      http://code.jquery.com/jquery-2.1.0.min.js
// @require      http://yui.yahooapis.com/3.18.1/build/yui/yui-min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @enabled      true
// ==/UserScript==

/////////////////////////////////////////////////////////////////////////////
//===DON'T TOUCH ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING====//
var _formPreviewerContainer = function(){
    var previewercontainer,
        input, location, name, beforeFieldset, between, afterFieldset, button, fieldset_container;
    return{
        init: function(l, i, n, b, bb, a){
            previewercontainer = this;
            previewercontainer.buildContents(l, i, n, b, bb, a);

            location.append(beforeFieldset + button + fieldset_container + afterFieldset);

            $('#' + name + '-preview-fieldset').hide();

            new _formPreviewer().init($('#' + name + '_preview'), input,
                name + '-preview-container', name + '-preview-fieldset');
        },
        initAfter: function(l, i, n, b, bb, a){
            previewercontainer = this;
            previewercontainer.buildContents(l, i, n, b, bb, a);

            $(beforeFieldset + button + fieldset_container + afterFieldset).insertAfter(location);

            $('#' + name + '-preview-fieldset').hide();

            new _formPreviewer().init($('#' + name + '_preview'), input,
                name + '-preview-container', name + '-preview-fieldset');
        },
        buildContents: function(l, i, n, b, bb, a){
            beforeFieldset = b? b : "";
            between = bb? bb : "";
            afterFieldset = a? a: "";
            location = l;
            input = $(i);
            name = n;

            button = '<button type="button" id="' +
            name +'_preview" ' +
            'style="width:57px; height:18px; color:rgb(0, 0, 0); text-indent:0px; line-height:0px">Preview</button>';

            fieldset_container =
            bb + '<fieldset id="' + name + '-preview-fieldset">' +
            '<strong>Preview</strong>' +
            '<div id="' + name + '-preview-container" style="border:1px solid #eee;"></div></fieldset>';
        },
    };
};

var _formPreviewer = function() {
    var button, comment, container, fieldset, previewer;
    return {
        init: function(button, commentSelector, containerId, fieldsetID){
            comment = $(commentSelector).get(0);
            container = document.getElementById(containerId);
            fieldset = document.getElementById(fieldsetID);
            previewer = this;

            button.click(function() {
                var text = comment.value;
                $(fieldset).show();
                previewer.showLoading();
                $.post("/account/?mode=preview", {content: encodeURIComponent(text)})
                .done(previewer.previewContentSuccess)
                .fail(previewer.previewContentFailure);
            });
        },
        showLoading: function() {
            container.innerHTML = "<p><strong>Loading, please wait...</strong></p>";
        },
        previewContentSuccess: function(res){
            $(fieldset).show();
            container.innerHTML = res;
        },
        reviewContentFailure: function(res){
            $(fieldset).show();
            container.innerHTML = "didn't work";
        }
    };
};

var _modpp = {
    // [ Feature: Moddog Header Extra Links ]
    // True - Include link to The Board; False - No link:
    boardLinkPresent: GM_getValue("boardLinkPresent", false),

    // True - Include link to the Ban Manager; False - No link:
    banManagerLinkPresent: GM_getValue("banManagerLinkPresent", false),

    // True - Include link to the Soylent Form; False - No link:
    soylentLinkPresent: GM_getValue("soylentLinkPresent", true),

    // True - Include link to the Soylent Forum; False - No link:
    soylentForumLinkPresent: GM_getValue("soylentForumLinkPresent", true),

    // True - Include link to the BRQ Form; False - No link:
    brqPresent: GM_getValue("brqPresent", true),

    // True - Include link to the COPPA Form; False - No link:
    coppaPresent: GM_getValue("coppaPresent", true),

    MutationObserver: window.MutationObserver || window.WebKitMutationObserver,

    forumNum: 3,

    forumNames: GM_getValue("forumNames", []),

    forumIDs: GM_getValue("forumIDs", []),

    observer: null,

    updated: false,

    /**
     * Called when the script loads.
     */
    init: function(){
        "use strict";

        if( document.location.pathname.match(/^\/forum\/mod\/ip\//) ){
            _modpp.addIPSearchLinksToIPPage();
            _modpp.addTopicsLinkToIPPage();
        }
        else if( document.location.pathname.match(/^\/forum\/mod\//) ){
            // viewing the forum move page
            _modpp.addMoveQuickSelectLinks();
            _modpp.addQuickSelectButtons();
            _modpp.postMoveThreadLinks();
            _modpp.addFormPreviewerToThreadMovePage();

            $("#content-padding").css("background-color", "white");
        }

        if( document.location.pathname.match(/^\/forum\/.*\/t.\d+/) ){
            // Viewing a forum thread

            // Add Mod++ material
            _modpp.addForumLinksToUserPlaces();
            _modpp.addForumMoveLinkAtPageTop();

            // Add functionality to thread page to check if there is a page
            // change, and thus if the user links need to be readded
            _modpp.observer = new MutationObserver(function(mutations) {
                var needUpdate = false;
                mutations.forEach(function(mutation) {
                    if(mutation.target.id == "content-padding"){
                        needUpdate = true;
                    }
                });

                if (needUpdate && !_modpp.updated && $('.moveSpan').length === 0){
                   _modpp.addForumLinksToUserPlaces();
                   _modpp.addForumMoveLinkAtPageTop();
                }

                // TODO: for some reason when it's in OOP, this function runs twice
                // this will stop it from updating; should figure out cause and
                // actually fix it later
                if(needUpdate){
                    _modpp.updated = !_modpp.updated;
                }
            });

            _modpp.observer.observe(document, { childList: true, subtree: true });

            //Check if Better Gaia is on, if it is, shift the move button down:
            if( $(".bg_plate").length > 0 ){
                $("#forum-modtools").css("padding-top", "6px",
                                         "padding-bottom", "6px",
                                         "padding-left", "13px");
                $(".linklist_last").css("margin-bottom", "0px");
            }
        }

        if( document.location.pathname.match(/^\/moddog/) ){
            // viewing any moddog page
            _modpp.addMDHeaderLinks();
        }

        if(document.location.pathname.match(/^\/admin\/user\/mod/)){
            // viewing profile tools page
            // add standard MD header links
            _modpp.addMDHeaderLinks();

            // add extra links to the profile page
            _modpp.addExtraPTLinks();

            _modpp.addReportProfileLinkToPT();
            _modpp.addFormPreviewerToPTDisableSection();
        }

        if( document.location.pathname.match(/^\/moddog\/report/) ){
            // viewing report in Moddog or the report listing views
            _modpp.addModFAAdminPMLink();
            _modpp.addMDReportSelectNewButton();
            _modpp.addFormPreviewerToReportsView();

            if(!document.location.pathname.match(/^\/moddog\/report\/area/)){
            // only when viewing a report in Moddog, but not the listing page in general
                _modpp.addMDReportExtraLinks();
            }
        }

        if( document.location.pathname.match(/^\/moddog\/note/) ||
            document.location.pathname.match(/^\/moddog\/report\/area/) ){
            // viewing notes in Moddog
            _modpp.addNotesExtraLinks();
            _modpp.addLinkToThreadMoveFlag();
            //_modpp.addExtraFlags();
        }

        if( document.location.pathname.match(/^\/profile\/privmsg.php/) ){
            // anything to do with PMs screens
            _modpp.addPrivMsgModdogLink();
            _modpp.addPMPageLinkToEditScreen();
        }

        if( document.location.pathname.match(/^\/account\//)){
            // viewing the account settings page
            _modpp.addScriptSettingsToAccountSettings();
        }
        if( document.location.href.indexOf("report.php?r=50") > -1){
            // viewing the BRQ page
            _modpp.addFormPreviewerToBRQ();
        }
        if( document.location.href.indexOf("profile/privmsg.php?folder=inbox&mode=quote") > -1){
            _modpp.addReportPMLink();
            _modpp.addPMSenderInfoLinks();
        }
        if ( document.location.href.indexOf("/gaia/report.php") > -1){
            _modpp.addLinkToReport();
        }
    },
    /**
     * Show options for user to toggle options associated with Mod++.
     */
    addScriptSettingsToAccountSettings: function(){
        "use strict";

        var text = '<h1>Mod++ UserScript Settings</h1>' +
            '<div class="fname">' +
                '<label for="preferences-boardLinkPresent">' +
                    'Include Moddog Header Links For: ' +
                '</label>' +
            '</div>' +
            '<div class="fval">'+
                '<div>' +
                    '<label for="preferences-boardLinkPresent">' +
                        '<input type="checkbox" ' +
                        'id="preferences-boardLinkPresent" value="1" ' +
                        (_modpp.boardLinkPresent ? 'checked="checked"' : '') +
                        '> The Board' +
                    '</label>' +
                '</div>' +
                '<div>' +
                    '<label for="preferences-banManagerLinkPresent">' +
                        '<input type="checkbox" ' +
                        'id="preferences-banManagerLinkPresent" value="1" ' +
                        (_modpp.banManagerLinkPresent ? 'checked="checked"' : '') +
                        '> Ban Manager'+
                    '</label>' +
                '</div>' +
                '<div>' +
                    '<label for="preferences-soylentLinkPresent">' +
                    '<input type="checkbox" ' +
                    'id="preferences-soylentLinkPresent" value="1" ' +
                    (_modpp.soylentLinkPresent ? 'checked="checked"' : '') +
                    '> Soylent Form' +
                    '</label>' +
                '</div>' +
                '<div>' +
                    '<label for="preferences-soylentForumLinkPresent">' +
                    '<input type="checkbox" ' +
                    'id="preferences-soylentForumLinkPresent" value="1" ' +
                    (_modpp.soylentForumLinkPresent ? 'checked="checked"' : '') +
                    '> Soylent Forum' +
                    '</label>' +
                '</div>' +
                '<div>' +
                    '<label for="preferences-brqPresent">' +
                        '<input type="checkbox" ' +
                        'id="preferences-brqPresent" value="1" ' +
                        (_modpp.brqPresent ? 'checked="checked"' : '') +
                        '> BRQ Form' +
                    '</label>' +
                '</div>' +
                '<div>' +
                    '<label for="preferences-coppaPresent">' +
                        '<input type="checkbox" ' +
                        'id="preferences-coppaPresent" value="1" ' +
                        (_modpp.coppaPresent ? 'checked="checked"' : '') +
                        '> COPPA Form' +
                    '</label>' +
                '</div>' +
            '</div>' +
            '<div class="fname">' +
                '<label for="preferences-featureExtraQuickSelectButtonsOn">Extra Quick Select:' +
                '</label>' +
            '</div>' +
            '<div class="fval">'+
                '<div>' +
                    '<label for="preferences-featureExtraQuickSelectButtonsOn">' +
                        'List your own custom quick select options to the ' +
                        'thread move screen (custom name, and forum number):' +
                    '</label>' +
                '</div>' +
                '<div id="hidden_options" class="show qs-options">' +
                    '<div id="qs-options-content"></div>' +
                    '<button id="add-option-button" type="button">Add</button>' +
                    '<button id="save-option-button" type="button">Save</button>' +
                    '<button id="undo-option-button" type="button">Undo All</button>' +
                    '<span id="qs-options-status"> Saved!</span>' +
                '</div>' +
            '</div>';

        var column = $('.rightColumn');

        column.append(text);

        // Add clicking functionality to each checkmark
        $('#preferences-boardLinkPresent').click(function() {
            GM_setValue("boardLinkPresent", this.checked);
        });

        $('#preferences-banManagerLinkPresent').click(function() {
            GM_setValue("banManagerLinkPresent", this.checked);
        });

        $('#preferences-soylentLinkPresent').click(function() {
            GM_setValue("soylentLinkPresent", this.checked);
        });

        $('#preferences-soylentForumLinkPresent').click(function() {
            GM_setValue("soylentForumLinkPresent", this.checked);
        });

        $('#preferences-brqPresent').click(function() {
            GM_setValue("brqPresent", this.checked);
        });

        $('#preferences-coppaPresent').click(function() {
            GM_setValue("coppaPresent", this.checked);
        });

        // Hide the "Saved!" feedback text and add animation
        $('#qs-options-status').hide();

        _modpp.updateOptionsContents();

        // Add "Add" button functionality
        $('#add-option-button').click(function() {
            _modpp.addOptionFunction();
        });

        // Add "Save" button functionality
        $('#save-option-button').click(function() {
            _modpp.forumNames = [];
            _modpp.forumIDs = [];

            for(var i = 0; i < $('.forumName').length; i++){
                _modpp.forumNames.push($('.forumName')[i].value);
                _modpp.forumIDs.push($('.forumID')[i].value);
            }
            GM_setValue("forumNames", _modpp.forumNames);
            GM_setValue("forumIDs", _modpp.forumIDs);

            $('#qs-options-status').show();
            $('#qs-options-status').fadeOut(1000, function() {
                // Animation complete.
            });
        });

        // Add "Undo" button functionality
        $('#undo-option-button').click(function() {
            _modpp.forumNames = GM_getValue("forumNames", []);
            _modpp.forumIDs = GM_getValue("forumIDs", []);
            _modpp.updateOptionsContents();
        });

    },
    /**
     * Update forum quick links panel.
     */
    updateOptionsContents: function() {
        $('#qs-options-content').html("");

        for(var i = 0; i < _modpp.forumNames.length; i++){
            var ii = i + 1;
            var text =
                '<input type="text" style="width: 150px;" class="forumName" name="forumName' +
                ii + '" id="forumName' + ii + '" placeholder="Forum ' + ii + ' Name">' +
                '<input type="text" style="width: 85px;" class="forumID" name="forumID' +
                ii + '" id="forumID' + ii + '" placeholder="Forum Number">' +
                '<button id="delete-option-button' + ii + '" type="button">Delete</button><br>';
            $('#qs-options-content').html($('#qs-options-content').html() + text);
        }
        var ii = 0;
        for(var i = 0; i < _modpp.forumNames.length; i++){
            ii = ii + 1;
            $('.forumName')[i].value = _modpp.forumNames[i];
            $('.forumID')[i].value = _modpp.forumIDs[i];
            (function(ii){
                $('#delete-option-button' + ii).click(function() {
                    _modpp.deleteButton(ii);
                });
            })(ii);
        }
    },
    addOptionFunction: function() {
        _modpp.forumNames = [];
        _modpp.forumIDs = [];
        // Save whatever is there already
        for(var i = 0; i < $('.forumName').length; i++){
            _modpp.forumNames.push($('.forumName')[i].value);
            _modpp.forumIDs.push($('.forumID')[i].value);
        }
        // Add one more new one
        _modpp.forumNames.push("");
        _modpp.forumIDs.push("");

        _modpp.updateOptionsContents();
    },
    /**
     * Delete forum quick link row.
     * @param buttonNum number of row to be deleted
     */
    deleteButton: function(buttonNum) {
        _modpp.forumNames.splice(buttonNum - 1, 1);
        _modpp.forumIDs.splice(buttonNum - 1, 1);
        _modpp.updateOptionsContents();
    },
    /**
     * Add quick links to thread moving page.
     */
    addMoveQuickSelectLinks: function(){
        "use strict";

        var startNum = $("#forum");

        if (!startNum || startNum.length < 1) return;

        startNum = startNum.find(":selected").val().split(" ")[0];

        var threadNum = window.location.href.split("/")[6];
        var secondLinkToUse = '';
        var origForumLinkToUse = '';
        var targetForumLinkToUse =
            '[<a id="changingLink">Link to Target Forum</a>]';

        if (startNum != ''){
            origForumLinkToUse =
                '[<a target="_blank"' +
                ' href="http://www.gaiaonline.com/forum/f.' +
                startNum +'/">Link to Original Forum</a>]';
            targetForumLinkToUse =
                '[<a id="changingLink" target="_blank"'+
                ' href="http://www.gaiaonline.com/forum/f.' +
                startNum +'/">Link to Target Forum</a>]';
        }

        if (threadNum != null){
            secondLinkToUse =
                '[<a id="changingLink" target="_blank"' +
                ' href="http://www.gaiaonline.com/forum/t.' +
                threadNum + '/">Return to Thread</a>]';
        }

        var toAdd =
            '<small> ' +
                origForumLinkToUse + ' ' +
                targetForumLinkToUse + ' ' +
                secondLinkToUse +
            '</small>';

        $(toAdd).insertBefore($('#mod-qselect').parent().prev());

        // Add dynamic target forum linking
        $("#forum").change(function() {
            $("#changingLink").attr("href",
                "http://www.gaiaonline.com/forum/f." +
                $("#forum").find(":selected").val().split(" ")[0] + "/");
        });

        // Add compatibility with the quick select buttons
        $('a[id^="mod-"]').click(function(){ $("#forum").trigger('change'); });
    },
    addQuickSelectButtons: function(){
        "use strict";

        //----Add custom quick select buttons----//
        for (var i = 0; i < _modpp.forumNames.length; i++){
            var toAdd = '[<a href="#" id="mod-' + i + '">' + _modpp.forumNames[i] + '</a>] ';
            $('#mod-qselect').html($('#mod-qselect').html() + toAdd);
        }

        for (i = 0; i < _modpp.forumIDs.length; i++){
            $('#mod-' + i).click( _modpp.selectCallback(i) );
        }

        //----Add functionality to FA buttons----//
        $('#mod-cb').on('click', function(){
            $("#forum option[value='23 chatterbox']").prop('selected', true);
        });

        $('#mod-rb').click( function(){
            $("#forum option[value='77 recycle-bin']").prop('selected', true);
        });
    },
    selectCallback: function(i){
        "use strict";

        return function(){
            $('#forum option[value^="' + _modpp.forumIDs[i] + ' "]').prop('selected', true);
        };
    },
    postMoveThreadLinks: function(){
        "use strict";

        var threadNum = document.location.pathname.split("/");

        if (threadNum.length > 5){
            threadNum = threadNum[4];

            // If on the page to move a thread
            var startForumName = $("#forum").find(":selected").html().replace('|--','');
            var forumNum = $("input[name='old_forum']").val();
            $('.btn-submit').click(function(){
                var redirectURL = $("input[name='redirect.url']");
                if (redirectURL.length !== 0){
                    GM_setValue('redirectURL', redirectURL.val());
                }
                GM_setValue('threadMoved', threadNum);
                GM_setValue('threadMovedForum', forumNum);
                GM_setValue('threadMovedForumName', startForumName);
            });
        }
        else{
            // If on the page where a thread has been moved
            if($('#messagebox').length !== 0){
                var num = GM_getValue('threadMoved', null);
                var fNum = GM_getValue('threadMovedForum', null);
                var fName = GM_getValue('threadMovedForumName', null);
                if (num !== null && fNum !== null && fName !== null){
                    // Reached if only one thread was moved and it was done by
                    // clicking move from the thread itself
                    var text =
                        'Click <a href="/forum/t.' + num + '/">here</a> ' +
                        'to go back to the thread.<br>' +
                        'Click <a href="/forum/f.' + fNum + '/">here</a> ' +
                        'to go back to <strong>' + fName + '</strong>.';
                    $('#messagebox').append(text);
                    GM_deleteValue('threadMoved');
                    GM_deleteValue('threadMovedForum');
                    GM_deleteValue('threadMovedForumName');
                } else{
                    // Reached if thread was reached by moving it from elsewhere
                    var redirectURL = GM_getValue('redirectURL', null);
                    if (redirectURL !== null){
                        var elseText =
                            'Click <a href="' + redirectURL + '">here</a> ' +
                            'to go back to where you were.<br>';
                        $('#messagebox').append(elseText);
                        GM_deleteValue('redirectURL');
                    }
                }
            }
            else{
                // If on the page to move thread and was reached by means other
                // than clicking move from the thread itself
                var movedRedirectURL = $("input[name='redirect.url']");
                if (movedRedirectURL.length !== 0){
                    GM_setValue('redirectURL', movedRedirectURL.val());
                }
                GM_deleteValue('threadMoved');
                GM_deleteValue('threadMovedForum');
                GM_deleteValue('threadMovedForumName');
            }
        }
    },
    /**
     * Add extra links to user places.
     */
    addForumLinksToUserPlaces: function(){
        "use strict";

        var post_metas =  $('.post-meta');

        for (var i = 0; i < post_metas.length; i++){
            var avatarURL = $(post_metas[i]).closest('.postcontent')
                .find('.avatar_wrapper').find('.avi_box a').attr('href');

            if(!avatarURL) {
                // this occurs if the avatar is an animated one
                avatarURL = $(post_metas[i]).closest('.postcontent')
                    .find('.avatar_wrapper').find('.avi_box').find('#animated_item object').attr('onmousedown');
            }

            var user_profile_tokens = avatarURL.split('/');

            var userid = user_profile_tokens[user_profile_tokens.length - 2];

            var toAdd =
                '<ul><span style="font-size:11px"> ' +
                    '[ <a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/forum/myposts/' +
                        userid + '/">View Posts</a> | ' +
                    '<a ' +'target="_blank"' +
                        ' href="http://www.gaiaonline.com/forum/mytopics/' +
                        userid + '/">View Topics</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/profiles/' +
                        userid + '/">View Profile</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/admin/user/mod/' +
                        userid + '">Profile Tools</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/moddog/note/search/' +
                        userid + '">Moddog Tools</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/moddog/report/area/888/?offender='
                        + userid + '&status=all">Reports Against' +
                        '</a> | ' + userid + ' ]</small>' +
                '</ul>';
            $(toAdd).insertAfter($(post_metas[i]).parent().parent());
        }

        // re-jump page to anchor if necessary
        var hash = document.location.pathname.split('/');
        if(location.hash.length > 0){
            var temp = location.hash;
            location.hash = '#dummy_hash';
            location.hash = temp;
        }
    },
    /**
     * Add mod tools at bottom of thread pages to top of the page.
     */
    addForumMoveLinkAtPageTop: function(){
        "use strict";

        var mod_tools = $('#forum-modtools');

        $('.detail-navlinks:first').find('#hdr_report_links')
            .append('<span class="separator"> | </span>');
        $('.detail-navlinks:first').find('#hdr_report_links')
            .append(mod_tools.wrap('<p/>').parent().html());

        mod_tools.unwrap();

        // re-jump page to anchor if necessary
        var hash = document.location.pathname.split('/');
        if(location.hash.length > 0){
            var temp = location.hash;
            location.hash = '#dummy_hash';
            location.hash = temp;
        }
    },
    /**
     * Add extra links to the header of MD pages.
     */
    addMDHeaderLinks: function(){
        "use strict";

        var there = $('li[class^="right"]').html();

        var board =
            _modpp.boardLinkPresent ?
                '<a href="http://www.gaiaonline.com/gaia/report.php?r=51">The Board | </a>' : '';
        var banManager =
            _modpp.banManagerLinkPresent ?
                '<a href="http://www.gaiaonline.com/admin/?mode=banManager">Ban Manager | </a>' : '';
        var soylent =
            _modpp.soylentLinkPresent ?
                '<a href="http://www.gaiaonline.com/gaia/report.php?r=400">Soylent Form | </a>' : '';
        var soylentForum =
            _modpp.soylentForumLinkPresent ?
                '<a href="http://www.gaiaonline.com/forum/soylent-green-research/f.100/">Soylent Forum | </a>' : '';
        var brq =
            _modpp.brqPresent ?
                '<a href="http://www.gaiaonline.com/gaia/report.php?r=50">Ban Requests | </a>' : '';
        var coppa =
            _modpp.coppaPresent ?
                '<a href="http://www.gaiaonline.com/gaia/report.php?r=52">COPPA | </a>' : '';

        var here = board + banManager + coppa + brq + soylentForum + soylent + there;

        $('li[class^="right"]').html(here);
    },
    /**
     * Add link to PM the person that is associated with the handling in a MD
     * note.
     */
    addModFAAdminPMLink: function(){
        "use strict";

        var modName =
            $("b[style='color:#0EB32A'], b[style='color:#FFA34F'], b[style='color:#996633']");
        var parent = $(modName).parent();
        if(parent.get(0) != null){
            var parenthtml = parent.get(0).innerHTML;
            var match = /\((\d+)\)/i.exec(parenthtml);
            var userid = match[1];
            var links =
                '<a href="http://www.gaiaonline.com/profile/privmsg.php?mode=post&u=' +
                    userid + '">PM Moderator</a>';
            parent.append(links);

            parent.find('a').attr('target', '_blank');
        }
    },
    /**
     * Add button to only select new reports (and not just those that are
     * 'open').
     */
    addMDReportSelectNewButton: function(){
        "use strict";

        // Add the button
        $('#mark_unmark').append('| <a href="#placeholder" id="mark_new">New</a>');

        // Give the button function
        $('#mark_new').click( function(){
            $('tr.rowon2,tr.rowoff2').each (function() {
                $(this).find('td.mark').get(0).children[0].removeAttribute("checked");
            });
            $('tr.rowon,tr.rowoff').each (function() {
                if($(this).find('td.status').text() == 'New' || $(this).find('td.status').length == 0){
                    $(this).find('td.mark').get(0).children[0].setAttribute("checked", true);
                }
                else{
                    $(this).find('td.mark').get(0).children[0].removeAttribute("checked");
                }
            });
        });
    },
    /**
     * Add extra notes to the user in a MD notes page.
     */
    addNotesExtraLinks: function(){
        "use strict";

        var pt =  $('a[href^="/admin/user/mod/"]');
        for(var i = 0; i < pt.length && $(pt[i]).parents('#tools').length === 0; i++ ){
            var item = pt[i];
            var parts = $(item).attr('href').split('/');
            var userid = parts[parts.length - 1];
            var parent = $(item).parent();

            var links =
                ' <a href="http://www.gaiaonline.com/forum/mytopics/' +
                    userid + '">Topics</a> ' +
                ' <a href="http://www.gaiaonline.com/forum/myposts/' +
                    userid + '">Posts</a> ' +
                ' <a href="http://www.gaiaonline.com/p/' +
                    userid + '">Profile</a> ' +
                ' <a href="http://www.gaiaonline.com/forum/mod/ip/?u=' +
                    userid + '">IP Search</a> ';

            parent.append(links);

            parent.find('a').attr('target', '_blank');
        }
    },
    /**
     * Add extra links to a MD report with reference to the offender and
     * reporter.
     */
    addMDReportExtraLinks: function(){
        "use strict";

        var pt =  $('a[href^="/admin/user/mod/"]');
        for(var i = 0; i < pt.length &&
                pt.parents('.pagination').length === 0 &&
                $(pt[i]).parents('#tools').length === 0; i++ ){
            var item = pt[i];
            var parts = $(item).attr('href').split('/');
            var userid = parts[parts.length - 1];
            var parent = $(item).parent();

            var links =
                ' <a href="http://www.gaiaonline.com/forum/mytopics/' +
                    userid + '">Topics</a> ' +
                ' <a href="http://www.gaiaonline.com/forum/myposts/' +
                    userid + '">Posts</a> ' +
                ' <a href="http://www.gaiaonline.com/p/' +
                    userid + '">Profile</a> ' +
                ' <a href="http://www.gaiaonline.com/forum/mod/ip/?u=' +
                    userid + '">IP Search</a> ';

            if($(item).parent('#tools').length === 0){
                parent.append(links);
            }

            parent.find('a').attr('target', '_blank');
        }
    },
    /**
     * Add link to the MD page of the recipient of a PM.
     */
addPrivMsgModdogLink: function(){
    "use strict";

    var message = $(".errorMessage");

    if(message.length < 1) return;

    var messagehtml = message.get(0).innerHTML;
    var usernameMatch =
        /Your Private Message has been sent to: ([^<]*)/i.exec(messagehtml);
    if (!usernameMatch) return;

    var username = usernameMatch[1];
    var encodedUsername = username.replace(/ /g, '+'); // Replace spaces with + for the URL
    var target = 'target="_blank"';
    var links =
        '<br><br><a href="http://www.gaiaonline.com/moddog/note/search/' +
        encodedUsername + '" ' + target + '>Moddog Notes for ' + username + '</a>'; // Use original username for display
    message.append(links);
},



    /**
     * Add extra links to the PT page to their last login IP and to their
     * journal.
     */
    addExtraPTLinks: function(){
        "use strict";

        // add journal link
        var pt =  document.location.pathname.split('/');
        var userid = pt[pt.length - 1];

        var text =
            '<li><a href="http://www.gaiaonline.com/journal/?mode=view&u=' +
            userid + '">View Journal</a></li>';
        $('ol').html($('ol').html() + text);

        // add IP link
        $('li').each(function(){
            var myRegexp = /Last Login IP: ([\d\.]+)/g;
            var match = myRegexp.exec($(this).html());
            if(match){
                $(this).html("Last Login IP: " +
                    '<a href="http://www.gaiaonline.com/forum/mod/ip/?i=' +
                        _modpp.convertIpToDecimal(match[1]) + '&u=' + userid + '">' + match[1] +
                    "</a>");
            }
        });

        var location = $('#mod_user_info p')[0].innerHTML.includes("BANNED") ?
            $('#mod_user_info p')[1] : $('#mod_user_info p')[0];

        // add break
        location.innerHTML = location.innerHTML +
            '<br/>';

        // add safe posts link
        location.innerHTML = location.innerHTML +
            'Safe <a href="http://www.gaiaonline.com/forum/myposts/' +
            userid  + '/?view=safe">Posts</a>';

        // add clarifying text
        location.innerHTML = location.innerHTML +
            '<br>View ';

        // add guilds link
        location.innerHTML = location.innerHTML +
            '<a href="http://www.gaiaonline.com/guilds/?gmode=search&user_id=' +
            userid  + '">Guilds</a>';

        // add clan link
        location.innerHTML = location.innerHTML +
            ' | <a href="http://www.gaiaonline.com/guilds/?gmode=search&user_id=' +
            userid  + '&is_clan=1">Clans</a>';
    },
    /**
     * Convert given IP to a decimal number.
     * @param ip IP to be converted in string form of XXX.XXX.XXX.XXX
     * @return the decimal representation of the IP
     */
    convertIpToDecimal: function(ip) {
        "use strict";

        // ref: https://gist.github.com/albrow/5709119

        var ipAddressRegEx =
            /^(\d{0,3}\.){3}.(\d{0,3})$|^(\d{0,3}\.){5}.(\d{0,3})$/;
        var valid = ipAddressRegEx.test(ip);
        if (!valid) {
            return false;
        }
        var split_ip = ip.split('.');
        // make sure each value is between 0 and 255
        for (var i = 0; i < split_ip.length; i++) {
            var ip_section = split_ip[i];
            if (ip_section > 255 || ip_section < 0) {
                return false;
            }
        }
        if (split_ip.length == 4) {
            // IPv4
            return ((((((+split_ip[0])*256)+
                    (+split_ip[1]))*256)+
                    (+split_ip[2]))*256)+
                    (+split_ip[3]);
        } else if (split_ip.length == 6) {
            // IPv6
            return ((((((((+split_ip[0])*256)+
                (+split_ip[1]))*256)+
                (+split_ip[2]))*256)+
                (+split_ip[3])*256)+
                (+split_ip[4])*256)+
                (+split_ip[5]);
        }
        return false;
    },
    addBosSpotter: function(){
        "use strict";

    },
    addPMPageLinkToEditScreen: function(){
        "use strict";

        $('<td></td>')
            .insertAfter($('td strong:contains("Date")').parent());

        var PMlinks = $('a[class="topictitle"');

        for(var i = 0; i < PMlinks.length; i++){
            $(PMlinks.get(i)).parent().parent().parent().append(
                '<td><a href="' +
                    PMlinks.get(i).href.replace('read','quote') +
                    '"><span style="font-size:11px"> Read Safe</span></a><td>');
        }
    },
    addPersonalStocks: function(){
        "use strict";

    },
    addSemiAutoWarn: function(){
        "use strict";

    },
    addTopicsLinkToIPPage: function(){
        var userInfoLine =  $('a[href^="/admin/user/mod/"]');

        for(var i = 0; i < userInfoLine.length; i++ ){
            var item = userInfoLine[i];
            var parts = $(item).attr('href').split('/');
            var userid = parts[parts.length - 1];
            var parent = $(item).parent();

            var bracketI = parent.html().indexOf('(');
            var angleI = parent.html().indexOf('<a');

            var topics = ' <a href="http://www.gaiaonline.com/forum/mytopics/' + userid + '">Topics</a>, ';
            parent.html(parent.html().substring(0, bracketI + 1) + topics + parent.html().substring(angleI));

            parent.find('a').attr('target', '_blank');
        }
    },
    addIPSearchLinksToIPPage: function(){
        // add IP Search link
        $('a').each(function(){
            var myRegexp = /^((?:[0-9]{1,3}\.){3}[0-9]{1,3})$/g;
            var match = myRegexp.exec($(this).html());
            if(match){
                var toAdd = '<a target="_blank" href="http://whatismyipaddress.com/ip/' + match[1] +'">Geo</a>';
                $("<span>]</span>").insertAfter($(this));
                $(toAdd).insertAfter($(this));
                $("<span> [</span>").insertAfter($(this));
            }
        });

        $('i').each(function(){
            var myRegexp = /^((?:[0-9]{1,3}\.){3}[0-9]{1,3})/;
            var match = myRegexp.exec($(this).html());
            if(match){
                var toAdd = '<a target="_blank" href="http://whatismyipaddress.com/ip/' + match[1] +'">Geo</a>';
                $("<span>]</span>").insertAfter($(this));
                $(toAdd).insertAfter($(this));
                $("<span> [</span>").insertAfter($(this));
            }
        });
    },
    addExtraFlags: function(){
        var selectBox =  $('select[name="entry_flag"]');
        var toAdd = '<option value="test">&nbsp;-&nbsp;Test</option>';
        selectBox.html(selectBox.html() + toAdd);
    },
    addFormPreviewerToReportsView: function(){
        // For Comment into ModDog
        new _formPreviewerContainer().init($('table.notetomoddog > tbody'),
            '#form_comment', 'notetomoddog',
            '<tr><td colspan="4">', '', '</td></tr>');

        // For Reply to Offender
        new _formPreviewerContainer().init($('table.notetouser > tbody'),
            '#form_reply', 'notetouser',
            '<tr><td colspan="4">', '', '</td></tr>');

        // For Reply to Reporter
        new _formPreviewerContainer().init($('table.thankyoutouser > tbody'),
            '#form_thankyou', 'thankyoutouser',
            '<tr><td colspan="4">', '', '</td></tr>');
    },
    addFormPreviewerToThreadMovePage: function(){
        new _formPreviewerContainer().init($('.mod_options > fieldset'),
            '#mod-notes', 'mod_message',
            '<label>', '', '</label>');
    },
    addFormPreviewerToBRQ: function(){
        new _formPreviewerContainer().init($('textarea[name="data[reason]"').parent(),
            'textarea[name="data[reason]"', 'brq_message',
            '<div>', '', '</div>');
    },
    addLinkToThreadMoveFlag: function(){
        var flagRow = $('#notedetail > tbody tr').get(5);
        var flagBox = $(flagRow).children('.fval').get(0);
        var flagSpan = $(flagBox).children('span');
        var threadNum = flagSpan.get(0).innerHTML;
        console.log(threadNum.innerHTML);

        if(!isNaN(threadNum) && threadNum > 0){
            var text = '<a href="http://www.gaiaonline.com/forum/t.' +
                threadNum + '" target="_blank">' +
                threadNum + '</a>'

            flagSpan.html(text);
        }
    },
    addReportPMLink: function(){
        var PMbox = $('#entry_form');
        var PMId = $('input[name="id"]').val();
        var text = '<div style="padding-left:5px">' +
        '[ <a rel="nofollow" href="http://www.gaiaonline.com/gaia/report.php?r=15&pmid=' + PMId +'">' +
        '<strong>Report PM</strong>' +
        '</a> ]' +
        '</div>';
        $(text).insertBefore(PMbox);
    },
    addPMSenderInfoLinks: function(){
        var usernameBox = $('div#usernamecontainer').parent();
        var PMId = $('input[name="id"]').val();
        var userid = PMId.split('.')[0];

        var toAdd =
                '<ul><span style="font-size:11px"> ' +
                    '[ <a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/forum/myposts/' +
                        userid + '/">View Posts</a> | ' +
                    '<a ' +'target="_blank"' +
                        ' href="http://www.gaiaonline.com/forum/mytopics/' +
                        userid + '/">View Topics</a> | ' +
                    '<a ' + 'target="_blank" rel="nofollow"' +
                        ' href="http://www.gaiaonline.com/profiles/' +
                        userid + '/">View Profile</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/admin/user/mod/' +
                        userid + '">Profile Tools</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/moddog/note/search/' +
                        userid + '">Moddog Tools</a> | ' +
                    '<a ' + 'target="_blank"' +
                        ' href="http://www.gaiaonline.com/moddog/report/area/888/?offender='
                        + userid + '&status=all">Reports Against' +
                        '</a> | ' + userid + ' ]</small>' +
                '</ul>';
        usernameBox.append(toAdd);
    },
    addLinkToReport: function(){
        var message = $(".errorMessage");

        if(message.length < 1) return;
        var reportIdElement = message.find('strong');
        var reportid = reportIdElement.html();
        console.log(reportid);
        var text = '<a target="_blank" href="http://www.gaiaonline.com/moddog/report/view/' + reportid + '">' + reportid + '</a>';
        reportIdElement.html(text);
    },
    addReportProfileLinkToPT: function(){
        var pt =  document.location.pathname.split('/');
        var userid = pt[pt.length - 1];

        var text = '<a target="_blank" href="http://www.gaiaonline.com/gaia/report.php?r=22&rpost=' + userid + '">Report User\'s Profile</a>';
        $('#mod_user_menu > ol').append('<li>' + text + '</li>');

    },
    addFormPreviewerToPTDisableSection: function(){
        new _formPreviewerContainer().initAfter($('textarea[name="disable_reason_comments"'),
            'textarea[name="disable_reason_comments"', 'disable_reason_comments',
            '<div>', '', '</div>');

        new _formPreviewerContainer().initAfter($('textarea[name="pm_comment"'),
            'textarea[name="pm_comment"', 'pm_comment',
            '<div>', '', '</div>');
    }
};

$().ready(function () {
    "use strict";
    _modpp.init();
});


