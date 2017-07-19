module Route exposing (..)

import Html
import Html.Attributes

import Navigation exposing (Location)
import UrlParser as Url exposing ((</>), Parser, oneOf, parseHash, s, string)
import Data.Allocation as Allocation exposing (Slug)

type Route
    = Home
    | Login
    | Budget
    | Expense
    | Profile
    | ExpenseDetail Slug
    | EditExpense Slug
    | DeleteExpense Slug
    | Help

route : Parser (Route -> a) a
route =
    oneOf
        [ Url.map Home (s "home")
        , Url.map Login (s "login")
        , Url.map Budget (s "budget")
        , Url.map Expense (s "expense")
        , Url.map Profile (s "profile")
        , Url.map ExpenseDetail (s "expense" </> s "view" </> Allocation.slugParser)
        , Url.map Help (s "help")
        ]
      
routeToString : Route -> String
routeToString page =
    case page of
        Home -> "/process#home"
        Login -> "/process#login"
        Budget -> "/process#budget"
        Expense -> "/process#expense"
        Profile -> "/process#profile"
        ExpenseDetail slug -> "/process#expense/view/" ++ Allocation.slugToString slug
        Help -> "/process#help"
        EditExpense slug -> "/process/expense/edit/" ++ Allocation.slugToString slug
        DeleteExpense slug -> "/process/expense/delete/" ++ Allocation.slugToString slug

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
