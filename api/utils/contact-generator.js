import { company, name, address, phone, internet } from "faker";

export const generateFakeContacts = (n = 3) =>
  new Array(n).fill('toto').map(() => ({
    firstName: name.firstName(),
    lastName: name.lastName(),
    company: company.companyName(),
    jobTitle: name.jobTitle(),
    address: address.streetAddress(),
    city: address.city(),
    country: address.country(),
    primaryContactNumber: phone.phoneNumber(),
    otherContactNumbers: [phone.phoneNumber(), phone.phoneNumber()],
    primaryEmailAddress: internet.email(),
    otherEmailAddresses: [internet.email(), internet.email()],
    groups: ["Dev", "Node.js", "REST"],
    socialMedia: [
      { name: "Linkedin", link: internet.url() },
      { name: "Twitter", link: internet.url() }
    ]
  }));
