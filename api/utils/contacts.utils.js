import axios from "axios";
import { errorHandler } from "./error-handler";
import { ConfigService } from "../services";

const auth = {
  username: ConfigService.get("API_USER"),
  password: ConfigService.get("API_PASS")
};

/**
 *
 * @param {string} url
 * @param {import("mongoose").Schema.Types.ObjectId} contactId
 * @param {import("express").NextFunction} next
 */
export async function getContact(url, contactId, next) {
  try {
    const contact = await axios.get(`${url}/api/v1/contacts/${contactId}`, {
      auth
    });

    return contact.data
      ? contact.data
      : next(errorHandler("No contact found", 404));
  } catch (error) {
    next(errorHandler(error.message));
  }
}

/**
 *
 * @param {string} url
 * @param {import("mongoose").Schema.Types.ObjectId} contactId
 * @param {object} updateData
 * @param {import("express").NextFunction} next
 */
export async function updateContact(url, contactId, updateData, next) {
  try {
    const contact = await axios.put(
      `${url}/api/v1/contacts/${contactId}`,
      updateData,
      {
        auth
      }
    );

    return contact.data;
  } catch (error) {
    next(errorHandler(error.message));
  }
}

/**
 *
 * @param {string} url
 * @param {import("mongoose").Schema.Types.ObjectId} contactId
 * @param {import("express").NextFunction} next
 */
export async function removeExistingImage(url, contactId, next) {
  try {
    await axios.delete(`${url}/api/v2/contacts/${contactId}/image`, {
      auth
    });
  } catch (error) {
    next(errorHandler(error.message));
  }
}
