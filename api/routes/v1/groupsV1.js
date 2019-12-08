import { groupsV1 as v1 } from "../../controllers";
import { AsyncWrapper } from "../../utils/async-wrapper";

export default router => {
  // GET /api/v1/groups
  router.get("/groups", AsyncWrapper(v1.getGroups));

  // GET /api/v1/groups/:contactId
  router.get("/groups/:contactId", AsyncWrapper(v1.getGroupsForContact));
};
