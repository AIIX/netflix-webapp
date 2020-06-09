import QtQuick 2.10
import QtQuick.Controls 2.10
import QtQuick.Window 2.10
import QtWebEngine 1.8
import QtQuick.Layouts 1.3
import QtGraphicalEffects 1.0
import org.kde.kirigami 2.11 as Kirigami
import Mycroft 1.0 as Mycroft

Mycroft.Delegate {
    id: root
    property string currentUrl: "https://www.netflix.com"
    property bool loadnum: false

    WebEngineView {
        id: webView
        anchors.fill: parent
        focus: true
        objectName: "webengineview"

        profile {
            httpUserAgent: "Mozilla/5.0 (X11; CrOS armv7l 6946.63.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36"
        }

        settings {
            showScrollBars: false
        }

        url: currentUrl

        onUrlChanged: {
            console.log(url)
            console.log("Loading Changed")
            var ctUrl = webView.url.toString()
            var watchurl = ctUrl.substring(0, ctUrl.lastIndexOf('/'));
            console.log(watchurl)
            if(watchurl === "https://www.netflix.com/watch"){
                console.log("Got Video Player Page Nav Request")
                webView.runJavaScript("changeVideoPlayerNav()")
            }
        }

        onNavigationRequested: {
            console.log(request);
        }

        onLoadProgressChanged: {
            console.log(loadProgress)
            console.log(loadnum)
            if(loadProgress == 0){
                busyIndicatorPop.open()
            }
            if(loadProgress == 100){
                busyIndicatorPop.close()
            }

            if(loadProgress > 50 && loadnum){
                root.loadnum = false
                //webView.runJavaScript("SpatialNavigation.init()")
                //webView.runJavaScript("SpatialNavigation.add({selector: 'a, .focusable, btn, .btn, .nfTextField, .faq-list-item, .avatar-wrapper, title-card-container, .title-card-container'});")
                //webView.runJavaScript("SpatialNavigation.makeFocusable();")
                //webView.runJavaScript("SpatialNavigation.focus();")
            }
        }

        onLoadingChanged: {
            if(loadRequest.status == WebEngineView.LoadStartedStatus){
                root.loadnum = true
            }
            if(loadRequest.status == WebEngineView.LoadSucceededStatus){
                root.loadnum = false
                // Moved all the Navigation JS for Video Tiles to nav.js and loaded as a userscript
                // when the web page has finished loading
                busyIndicatorPop.close()
                webView.runJavaScript("checkForDRM()")
                //drmDialogBox.open()
            }
        }

        userScripts: [
            WebEngineScript {
                injectionPoint: WebEngineScript.DocumentCreation
                name: "SpaNav"
                worldId: WebEngineScript.MainWorld
                sourceUrl: Qt.resolvedUrl("third-party/spatial_navigation.js")
            },
            WebEngineScript {
                injectionPoint: WebEngineScript.Deferred
                name: "NavJS"
                worldId: WebEngineScript.MainWorld
                sourceUrl: Qt.resolvedUrl("code/nav.js")
            },
            WebEngineScript {
                injectionPoint: WebEngineScript.DocumentCreation
                name: "DetectDrm"
                worldId: WebEngineScript.MainWorld
                sourceUrl: Qt.resolvedUrl("code/detect-drm.js")
            }
        ]

        onJavaScriptConsoleMessage: {
            console.log(message)
        }
    }

    Popup {
        id: busyIndicatorPop
        width: parent.width
        height: parent.height
        background: Rectangle {
            anchors.fill: parent
            color: Qt.rgba(0, 0, 0, 0.5)
        }
        closePolicy: Popup.CloseOnEscape | Popup.CloseOnPressOutsideParent

        BusyIndicator {
            running: visible
            anchors.centerIn: parent
        }
    }

    Popup {
        id: drmDialogBox
        width: parent.width / 2
        height: parent.height / 2
        x: Math.round((parent.width - width) / 2)
        y: Math.round((parent.height - height) / 2)
        dim: true

        onOpened: {
            continueButton.forceActiveFocus();
        }

        background: Rectangle {
            color: Kirigami.Theme.backgroundColor
            layer.enabled: true
            anchors.fill: parent
            anchors.margins: Kirigami.Units.gridUnit
            layer.effect: DropShadow {
                horizontalOffset: 0
                verticalOffset: 2
                radius: 8.0
                samples: 8
                color: Qt.rgba(0,0,0,0.6)
            }
        }

        Item {
            id: descBox
            anchors.fill: parent
            anchors.margins: Kirigami.Units.gridUnit

            Kirigami.Heading {
                id: descBoxDesc
                visible: text.length > 0
                wrapMode: Text.WordWrap
                horizontalAlignment: Text.AlignHCenter
                verticalAlignment: Text.AlignVCenter
                anchors.top: parent.top
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: descBoxButtonSept.top
                level: 3
                elide: Text.ElideRight
                color: Kirigami.Theme.textColor
                text: "Widevine DRM not found on this device, Netflix requires Widevine DRM to work correctly, A script will be executed in attempt to install the Widevine DRM, The process will requires a minimum of 2GB of space, Select 'Continue' to proceed with the installation or Select 'Cancel' to attempt manual installation of DRM."
            }

            Kirigami.Separator {
                id: descBoxButtonSept
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: descBoxButtonLayout.top
            }

            RowLayout {
                id: descBoxButtonLayout
                anchors.bottom: parent.bottom
                anchors.left: parent.left
                anchors.right: parent.right
                height: parent.height * 0.25

                Button {
                    id: continueButton
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    KeyNavigation.right: cancelButton
                    text: "Continue"

                    background: Rectangle {
                        Kirigami.Theme.colorSet: Kirigami.Theme.Button
                        color: continueButton.activeFocus ? Kirigami.Theme.highlightColor : Kirigami.Theme.backgroundColor
                    }

                    onClicked: {
                        descBoxDesc.text = "Executing Script, Please Wait!"
                    }

                    Keys.onReturnPressed: {
                        clicked();
                    }
                }

                Button {
                    id: cancelButton
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    KeyNavigation.left: continueButton
                    text: "Cancel"

                    background: Rectangle {
                        Kirigami.Theme.colorSet: Kirigami.Theme.Button
                        color: cancelButton.activeFocus ? Kirigami.Theme.highlightColor : Kirigami.Theme.backgroundColor
                    }

                    onClicked: {
                        drmDialogBox.close();
                        webView.forceActiveFocus();
                    }

                    Keys.onReturnPressed: {
                        clicked();
                    }
                }
            }
        }
    }
}
