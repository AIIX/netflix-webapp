# -*- coding: utf-8 -*-

from os.path import dirname
import sys
import json
import dbus
from adapt.intent import IntentBuilder
from mycroft.skills.core import MycroftSkill
from mycroft.messagebus.message import Message

__author__ = 'aix'
 
class NetflixWebApp(MycroftSkill):
    def __init__(self):
        super(NetflixWebApp, self).__init__(name="NetflixWebApp")

    def initialize(self):
        self.load_data_files(dirname(__file__))
        
        self.add_event('NetflixWebApp.aiix.home', self.showHome)

        nFlix = IntentBuilder("NetflixOpenKeyword"). \
            require("NetflixOpenKeyword").build()
        self.register_intent(nFlix, self.nFlix)
        
        nFlixSearch = IntentBuilder("NetflixSearchKeyword"). \
            require("NetflixSearchKeyword").build()
        self.register_intent(nFlixSearch, self.nFlixSearch)
        
        self.gui.register_handler('Netflix.suspendComp', 
                                  self.suspendComp)
        self.gui.register_handler('Netflix.resumeComp', 
                                  self.resumeComp)
    
    def showHome(self, message):
        self.gui.clear()
        self.enclosure.display_manager.remove_active()
        self.displayHome()
        
    def displayHome(self):
        self.gui.show_page("flixapp.qml")
        self.suspendComp()
    
    def nFlix(self, message):
        self.gui["currentUrl"] = "https://netflix.com"
        self.gui.show_page("flixapp.qml")

    def nFlixSearch(self, message):
        utterance = message.data.get('utterance').lower()
        utterance = utterance.replace(
            message.data.get('NetflixSearchKeyword'), '')
        searchQuery = utterance
        searchUrl = "https://netflix.com/search?q={0}".format(searchQuery)
        self.gui["currentUrl"] = searchUrl
        self.gui.show_page("flixapp.qml")
        
    def suspendComp(self):
        """
        Suspend Compositing
        """
        bus = dbus.SessionBus()
        remote_object = bus.get_object("org.kde.KWin","/Compositor") 
        remote_object.suspend(dbus_interface = "org.kde.kwin.Compositing")
        
        
    def resumeComp(self):
        """
        Resume Compositing
        """
        bus = dbus.SessionBus()
        remote_object = bus.get_object("org.kde.KWin","/Compositor") 
        remote_object.resume(dbus_interface = "org.kde.kwin.Compositing")

    def stop(self):
        self.enclosure.bus.emit(Message("metadata", {"type": "stop"}))

def create_skill():
    return NetflixWebApp()
