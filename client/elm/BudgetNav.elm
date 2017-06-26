module BudgetNav exposing (Page(..), urlChange, navLinks)

import Navigation
import UrlParser as Url exposing ((</>), (<?>), s, int, stringParam, top)
import Html exposing (Html,li,a)
import Html.Attributes exposing (href)

type Page = Home | Login

route : Url.Parser (Page -> a) a
route =
  Url.oneOf
    [ Url.map Home top
    , Url.map Login (s "login" )
    ]

urlChange : Navigation.Location -> Page
urlChange location =
    case Url.parseHash route location of
        Just page -> page
        Nothing -> Home

navLinks : List (Html a)
navLinks =
    List.map (\(hash,label) -> (li [] [ a [ Html.Attributes.href hash ] [ Html.text label ] ])) [("#", "Budget"), ("#login", "Login")]               
