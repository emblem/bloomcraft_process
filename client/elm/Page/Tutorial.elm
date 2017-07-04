module Page.Tutorial exposing (Msg, Model, init, initialState, view, update)

import Html exposing (..)
import Http
import Task exposing (Task)

import Bootstrap.Modal as Modal
import Bootstrap.Button as Button

import Request.Tutorial
import Data.Tutorial exposing (Tutorial)
import Page.Errored exposing (PageLoadError, pageLoadError)
import View.Page as Page
import Route exposing (Route)


type alias Model =
    { modalState : Modal.State
    , tutorial : Maybe (Tutorial Msg)
    }

type Msg
    = ModalMsg Modal.State

initialState : Model              
initialState =
    { modalState = Modal.hiddenState
    , tutorial = Nothing
    }
      
init : Maybe Route -> Task PageLoadError Model
init maybeRoute =
    let
        loadTutorial = case maybeRoute of
                           Just route -> Http.toTask (Request.Tutorial.tutorial route)
                           Nothing -> Task.succeed Nothing

        handleLoadError err =
            let
                l = Debug.log "Tutorial Load Err" err
            in
                pageLoadError Page.Other "Failed to load expenses"

        initModel : Maybe (Tutorial Msg) -> Model
        initModel tutorial =
            { tutorial = tutorial
            , modalState = case tutorial of
                               Just _ -> Modal.visibleState
                               Nothing -> Modal.hiddenState
            }
    in
        Task.map initModel loadTutorial
            |> Task.mapError handleLoadError

view : Model -> Html Msg
view model =
    Modal.config ModalMsg
        |> Modal.large
        |> Modal.h3 [] [ model.tutorial |> Maybe.map .header |> Maybe.withDefault "Error" |> text ]
        |> Modal.body [] [ model.tutorial |> Maybe.map .body |> Maybe.withDefault (text "No tutorial available") ]
        |> Modal.footer []
           [ Button.button
                 [ Button.outlinePrimary
                 , Button.onClick <| ModalMsg Modal.hiddenState
                 ]
                 [ text "Done" ]
           ]
        |> Modal.view model.modalState

update : Msg -> Model -> Model
update msg model =
    case msg of
        ModalMsg state -> {model | modalState = state}
