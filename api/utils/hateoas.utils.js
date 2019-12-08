/**
 * Generate links related to entity
 * @param {*} entity
 * @param {Express.Request} req
 */
export const generateSelf = ({ req, entity }) => {
  const self = [
    {
      href: `${req.protocol}://${req.hostname}:${req.app.get("port")}${
        req.path
      }${entity ? `/${entity._id}` : "{?offset,limit}"}`,
      method: "GET",
      rel: "self"
    }
  ];

  if (entity) {
    return [
      ...self,
      {
        href: `${req.protocol}://${req.hostname}:${req.app.get("port")}${
          req.path
        }/${entity._id}`,
        method: "PUT",
        rel: "update"
      },
      {
        href: `${req.protocol}://${req.hostname}:${req.app.get("port")}${
          req.path
        }/${entity._id}`,
        method: "DELETE",
        rel: "delete"
      },
      {
        href: `${req.protocol}://${req.hostname}:${req.app.get("port")}${
          req.path
        }/${entity._id}/image`,
        method: "GET",
        rel: "image"
      }
    ];
  }
  return self;
};
