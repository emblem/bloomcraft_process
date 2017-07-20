module Page.Help exposing (Msg, Model, update, view, init)

import Http
import Html exposing (Html, text, div, p, a, hr, h3,h5)
import Html.Attributes exposing (class, style, href)
import Task exposing (Task)

import Bootstrap.Grid as Grid
import Bootstrap.Grid.Col as Col
import Bootstrap.Grid.Row as Row

import Request.Tutorial
import Data.Tutorial exposing (Tutorial)
import Page.Errored exposing (pageLoadError, PageLoadError)
import View.Page as Page

type alias Model =
    { content : List (Tutorial Msg)
    }


view : Model -> Html Msg
view model =
    Grid.container []
        [ Grid.row [Row.centerMd]
          [ Grid.col [ Col.lg10 ]
              [ h3 [] [ text "Help" ]
              , hr [] []
              ]
          , Grid.col [ Col.lg10 ] <|
              List.map tutorialView model.content
          ] 
        ]

tutorialView : Tutorial Msg -> Html Msg
tutorialView tutorial =
    div []
        [ h5 [] [ text tutorial.header ]
        , hr [] []
        , div [ class "ml-5" ] [tutorial.body]
        ]

        
type Msg =
    Msg
            
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    (model, Cmd.none)

init : Task PageLoadError Model
init =
    let
        loadHelp = Http.toTask Request.Tutorial.help

        handleLoadError err =
            let
                l = Debug.log "Help Page Load Err" err
            in
                pageLoadError Page.Expense "Failed to load help page"

        initModel : List (Tutorial Msg) -> Model
        initModel content =
            { content = content
            }            
    in
        Task.map initModel loadHelp 
            |> Task.mapError handleLoadError
