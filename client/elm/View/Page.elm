module View.Page exposing (ActivePage(..), frame)

import Html exposing (Html, div, text, span)
import Html.Attributes exposing (href, class)

import Bootstrap.Navbar as Navbar
import Bootstrap.Grid as Grid

import Route exposing (Route)

import Data.Session exposing (Session)

type ActivePage
    = Home
    | Budget
    | Expense
    | Login
    | Other

frame : (Navbar.State -> a) -> Navbar.State -> Bool -> Session -> ActivePage -> Html a -> Html a
frame toMsg navState isLoading session page content =
    div []
        [ viewHeader toMsg navState page session isLoading
        , content
        , viewFooter
        ]

viewHeader : (Navbar.State -> a) -> Navbar.State -> ActivePage -> Session -> Bool -> Html a
viewHeader toMsg navState page session isLoading =
    Navbar.config toMsg
        |> Navbar.withAnimation
        |> Navbar.brand [href "#"] [text "Bloomcraft"]
        |> Navbar.items           
           [ Navbar.itemLink [href "#login"] [text "Sign in"]
           , Navbar.itemLink [href "#budget"] [text "Rental Income"]
           , Navbar.itemLink [href "#expense"] [text "Expenses"]
           ]
        |> Navbar.view navState |> Debug.log "Nav"

navLink : Bool -> Route -> List (Html a) -> Navbar.Item a
navLink isActive route content =
    let
        link = if isActive then Navbar.itemLinkActive else Navbar.itemLink
    in
        link [ href <| Route.routeToString route ] content            

viewFooter : Html a
viewFooter =
    Grid.container [] [ span [ class "attribution" ] [ text "Stoneship, LLC. 2017. MIT license." ] ]
