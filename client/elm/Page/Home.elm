module Page.Home exposing (initialModel, Model, view)

import Html exposing (div, text, Html, h1, p, hr, a)
import Html.Attributes exposing (class)

import Data.Session exposing (Session)
import Route

type alias Model = ()

initialModel : Model
initialModel =
    ()

view : Session -> Model -> Html a
view session model =
    div [ class "jumbotron m-4" ]
        [ h1 [ class "display-3" ] [ text "Welcome!" ]
        , p [ class "lead" ]
            [ text "This site helps to support Bloomcraft's governance process.  Today, you can use it to help make decisions about " 
            , a [ Route.href Route.Budget ] [ text "rents" ]
            , text " and "
            , a [ Route.href Route.Expense ] [ text "budgeting" ]
            , text "."
            ]
        , hr [ class "my-4" ] []
        , p [] [ text "If you run into trouble, contact admin@bloomcraft.space" ]
        ]
