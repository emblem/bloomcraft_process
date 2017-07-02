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
    | Profile
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
        |> Navbar.brand [Route.href Route.Home] [text "Bloomcraft"]
        |> Navbar.items
           (case session.user of
               Just user ->
                   [ activeLinkIf Profile page [Route.href Route.Profile ] [text user.fullname]
                   , activeLinkIf Budget page [Route.href Route.Budget] [text "Income"]
                   , activeLinkIf Expense page [Route.href Route.Expense] [text "Expenses"]
                   ]

               Nothing ->
                   [ activeLinkIf Login page [Route.href Route.Login] [text "Sign in"] ])
        |> Navbar.view navState

activeLinkIf : ActivePage -> ActivePage -> List (Html.Attribute msg) -> List (Html msg) -> Navbar.Item msg
activeLinkIf activePage page =
    if activePage == page then
        Navbar.itemLinkActive
    else
        Navbar.itemLink        
                       
viewFooter : Html a
viewFooter =
    Grid.container [] [ span [ class "attribution" ] [ text "Stoneship, LLC. 2017. MIT license." ] ]
