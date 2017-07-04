module Page.Tutor exposing (Msg, Model, init, view, update)

import Html exposing (..)

import Bootstrap.Modal as Modal

import Request.Tutor


type alias Model =
    { modalState : Modal.State
      content : Tutorial
    }

type Msg
    = Msg

init
