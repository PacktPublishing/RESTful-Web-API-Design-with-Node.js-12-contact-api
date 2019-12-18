import mongoose from "mongoose";

import { Contact } from "../models";
import { fmtUtils, generateSelf, errorHandler } from "../utils";
import DbConfig from "../config/db.config";

/**
 *
 * @param {{
 *  req: Express.Request;
 *  res: Express.Response;
 *  fields: {
 *      [field: string]: 0 | 1
 *  };
 * }} args
 */
export const findContacts = async args => {
  const { fields, req, res } = args;

  const contacts = fields
    ? await Contact.find().select(fields)
    : await Contact.find();

  fmtUtils.contentNegotiator({
    res,
    config: {
      json() {
        res.json({
          data: contacts.map(contact => ({
            data: contact.toJSON(),
            links: generateSelf({
              entity: contact.toJSON(),
              req
            })
          })),
          links: generateSelf({ req })
        });
      },
      html() {
        const orderedContactsPOJOArray = fmtUtils.getOrderedContactsPOJOArrayFrom(
          contacts
        );

        res.send(`
            ${fmtUtils.generateHTMLTable(
              `
                <tr>
                ${fmtUtils.generateHTMLTableHeaders(
                  orderedContactsPOJOArray[0],
                  ""
                )}
                </tr>
                ${orderedContactsPOJOArray.reduce((acc, contact) => {
                  return acc.concat(
                    "\n",
                    `
                    <tr style="border: 1px solid black;">
                        ${fmtUtils.generateHTMLCells(contact)}
                    </tr>
                       `
                  );
                }, "")}
                `
            )}
        `);
      },
      csv() {
        res.send(fmtUtils.convertToCSV(contacts.map(ct => ct.toObject())));
      },
      text() {
        res.send(
          contacts.reduce((acc, contact) => {
            return acc.concat(
              ",\n",
              JSON.stringify(contact, null, 4)
                .replace(/,/g, " ")
                .replace(/\{/g, "///#====================================\\ ")
                .replace(/\}/g, "\\====================================#///")
            );
          }, "")
        );
      }
    }
  });
};

export const deleteContactImage = async (req, res, next) => {
  if (!DbConfig.gfsBucket) return next(errorHandler("No gridfs bucket"));
  try {
    await DbConfig.gfsBucket.delete(
      new mongoose.Types.ObjectId(req.params.fileId)
    );

    res.json({ message: "Image removed" });
  } catch (error) {
    next(errorHandler(error.message));
  }
};

export const getContactImage = async (req, res, next) => {
  if (!DbConfig.gfsBucket) return next(errorHandler("No gridfs bucket"));

  try {
    const files = await DbConfig.gfsBucket
      .find({ filename: req.params.filename })
      .toArray();

    if (!files || files.length === 0) {
      return next(errorHandler("no files exist", 404));
    }

    DbConfig.gfsBucket.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
    next(errorHandler(error.message));
  }
};
