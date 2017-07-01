module Route exposing (..)

import Navigation exposing (Location)
import UrlParser as Url exposing ((</>), Parser, oneOf, parseHash, s, string)

type Route
    = Home
    | Login
    | Budget
    | Expense

route : Parser (Route -> a) a
route =
    oneOf
        [ Url.map Home (s "")
        , Url.map Login (s "login")
        , Url.map Login (s "budget")
        , Url.map Login (s "expense")
        ]
      
routeToString : Route -> String
routeToString page =
    case page of
        Home -> "home"
        Login -> "login"
        Budget -> "budget"
        Expense -> "expense"
      
modifyUrl : Route -> Cmd msg
modifyUrl =
    routeToString >> Navigation.modifyUrl

fromLocation : Location -> Maybe Route
fromLocation location =
    if String.isEmpty location.hash then
        Just Home
    else
        parseHash route location
