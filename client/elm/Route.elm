module Route exposing (..)

import Html
import Html.Attributes

import Navigation exposing (Location)
import UrlParser as Url exposing ((</>), Parser, oneOf, parseHash, s, string)

type Route
    = Home
    | Login
    | Budget
    | Expense
    | Profile

route : Parser (Route -> a) a
route =
    oneOf
        [ Url.map Home (s "home")
        , Url.map Login (s "login")
        , Url.map Budget (s "budget")
        , Url.map Expense (s "expense")
        , Url.map Profile (s "profile")
        ]
      
routeToString : Route -> String
routeToString page =
    case page of
        Home -> "app#home"
        Login -> "app#login"
        Budget -> "app#budget"
        Expense -> "app#expense"
        Profile -> "app#profile"

href : Route -> Html.Attribute a
href route =
    Html.Attributes.href <| routeToString route
      
modifyUrl : Route -> Cmd msg
modifyUrl =
    routeToString >> Navigation.modifyUrl

fromLocation : Location -> Maybe Route
fromLocation location =
    if String.isEmpty location.hash then
        Just Home
    else
        Debug.log "Route" <| parseHash route <| Debug.log "Location" location