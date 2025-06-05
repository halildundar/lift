import "./main.scss";
import "./jqform-serialize.js";
import { Routes } from "./router.js";
import{AjaxPromise} from './pages/auth/signin.js';
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
const GetBtnRoutes = () => {
  const routes = $("[route]");
  $.map(routes, (el) => {
    $(el).removeClass($(el).attr("routeactive"));
    if (
      !!$(el).attr("routeactive") &&
      $(el).attr("route") == window.location.pathname
    ) {
      $(el).addClass($(el).attr("routeactive"));
    }
    $(el).unbind("click");
    $(el).click(function (e) {
      const routePath = $(el).attr("route");
      GoToPageClick(routePath, {});
    });
  });
};

const ShowTemplate = async (routePath, viewId) => {
  const routes = Routes.routes.filter(function (r) {
    return routePath == r.path;
  });
  const route = routes[routes.length - 1];
  $(viewId).html("");
  if (!!route) {
    const resp = await fetch(`/templates/${route.template}`);
    const content = await resp.text();
    const rendered = Handlebars.compile(content);
    $(viewId).html(rendered({}));
    route.jsFnc();
  } else {
    const resp = await fetch("/templates/404.html");
    const content = await resp.text();
    const temp404 = Handlebars.compile(content);
    $(viewId).html(temp404);
  }
};
const GoToPageClick = (currPath, data) => {
  const route = Routes.routes.filter(function (r) {
    return currPath == r.path;
  })[0];
  if (!!route) {
    window.history.pushState({}, "", route.path);
    ShowTemplate(route.path, route.viewId);
    if (!!route.redirect) {
      GoToPageClick(route.redirect, {});
    }
  } else {
    window.history.pushState({}, "", currPath);
    ShowTemplate(currPath, "#root_view");
  }
  setTimeout(() => {
    GetBtnRoutes();
  }, 200);
};
const GoToPage = (currPath) => {
  let routes = Routes.routes.filter(function (r) {
    return currPath.includes(r.path);
  });
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (!!route) {
      window.history.pushState({}, "", route.path);
      ShowTemplate(route.path, route.viewId);
      if (!!route.redirect && currPath == route.path) {
        const route1 = Routes.routes.filter(function (r) {
          return route.redirect == r.path;
        })[0];
        window.history.pushState({}, "", route1.path);
        ShowTemplate(route1.path, route1.viewId);
      }
    } else {
      window.history.pushState({}, "", currPath);
      console.log("currPath", currPath);
      ShowTemplate(currPath, "#root_view");
    }
    if (i == routes.length - 1) {
      setTimeout(() => {
        GetBtnRoutes();
      }, 200);
    }
  }
  if (routes.length === 0) {
    window.history.pushState({}, "", currPath);
    ShowTemplate(currPath, "#root_view");
  }
};

const usrPnlArea = () => {
  $(".btn-user").on("click", function () {
    if ($(".usr-sm-pnl").css("display") === "none") {
      $(".usr-sm-pnl").css("display", "flex");
    } else {
      $(".usr-sm-pnl").css("display", "none");
    }
  });
  $(".allusrt").on("click", function (e) {
    e.stopPropagation();
  });
  $(".btn-signout").on("click", async function () {
    try {
      const resp = await AjaxPromise("post", "/signout", {});
      if (!!resp && resp.ok) {
        location.reload();
      }
    } catch ({ responseJSON }) {
      console.log("err", responseJSON);
      const { msg } = responseJSON;
      $(".err-txt").html(msg);
    }
  });
};

$(async function () {

  const currPath = window.location.pathname;
  GoToPage(currPath, {});
  usrPnlArea();

  $(document).on("click", function () {
    $(".usr-sm-pnl").css("display", "none");
  });
});
