module BudgetNav exposing (Page(..), urlChange, menu)
import Bootstrap.Navbar as Navbar
import Navigation
import UrlParser as Url exposing ((</>), (<?>), s, int, stringParam, top)
import Html exposing (Html,li,a, text)
import Html.Attributes exposing (href)

type Page = Home | Login | Budget | Expenses

route : Url.Parser (Page -> a) a
route =
  Url.oneOf
    [ Url.map Home top
    , Url.map Login (s "login" )
    , Url.map Budget (s "budget")
    , Url.map Expenses (s "expense")
    ]

urlChange : Navigation.Location -> Page
urlChange location =
    case Url.parseHash route location of
        Just page -> page
        Nothing -> Home

menu : (Navbar.State -> a) -> Navbar.State -> Html a
menu a model =
    Navbar.config a
        |> Navbar.withAnimation
        |> Navbar.brand [href "#"] [text "Bloomcraft"]
        |> Navbar.items
           [ Navbar.itemLink [href "#login"] [text "Sign in"]
           , Navbar.itemLink [href "#budget"] [text "Rental Income"]
           , Navbar.itemLink [href "#expense"] [text "Expenses"]
           ]
        |> Navbar.view model

