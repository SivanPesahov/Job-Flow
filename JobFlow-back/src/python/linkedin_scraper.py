import argparse
import json
from curl_cffi import CurlHttpVersion
from bs4 import BeautifulSoup
import random
from collections import OrderedDict
from fp.fp import FreeProxy
import ua_generator
from curl_cffi.requests import AsyncSession
import asyncio
from ua_generator.options import Options
from ua_generator.data.version import VersionRange, Version
from user_agents import parse

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def parse_job_list(jobs):
    data = []
    for job in jobs:
        try:
            jobid = (
                job.find("div", {"class": "base-card"})
                .get("data-entity-urn")
                .split(":")[3]
            )

            position = (
                job.find(class_="base-search-card__title").get_text(strip=True)
                if job.find(class_="base-search-card__title")
                else None
            )
            company = (
                job.find(class_="base-search-card__subtitle").get_text(strip=True)
                if job.find(class_="base-search-card__subtitle")
                else None
            )
            location = (
                job.find(class_="job-search-card__location").get_text(strip=True)
                if job.find(class_="job-search-card__location")
                else None
            )

            date_element = job.find("time")
            date = date_element["datetime"] if date_element else None

            job_url = (
                job.find(class_="base-card__full-link")["href"]
                if job.find(class_="base-card__full-link")
                else None
            )
            company_logo = (
                job.find(class_="artdeco-entity-image")["data-delayed-url"]
                if job.find(class_="artdeco-entity-image")
                else None
            )
            ago_time = (
                job.find(class_="job-search-card__listdate").get_text(strip=True)
                if job.find(class_="job-search-card__listdate")
                else None
            )

            data.append(
                {
                    "id": jobid,
                    "position": position,
                    "company": company,
                    "location": location,
                    "date": date,
                    "job_url": job_url,
                    "company_logo": company_logo,
                    "ago_time": ago_time,
                }
            )
        except AttributeError:
            continue
    return data


def get_element_or_none(tag, class_name):
    return tag.select(class_name)[0] if tag.select(class_name) else None


def parse_job_details(job):
    position = get_element_or_none(job, ".topcard__title").get_text(strip=True)

    company = get_element_or_none(job, ".topcard__flavor--black-link").get_text(
        strip=True
    )

    location = get_element_or_none(
        job, ".topcard__flavor.topcard__flavor--bullet"
    ).get_text(strip=True)

    company_logo = get_element_or_none(job, ".artdeco-entity-image").get(
        "data-delayed-url"
    )

    ago_time = get_element_or_none(job, ".posted-time-ago__text").get_text(strip=True)

    applicants = get_element_or_none(job, ".num-applicants__caption").get_text(
        strip=True
    )

    level = get_element_or_none(
        job,
        ".description__job-criteria-item:nth-child(1) .description__job-criteria-text--criteria",
    ).get_text(strip=True)

    type = get_element_or_none(
        job,
        ".description__job-criteria-item:nth-child(2) .description__job-criteria-text--criteria",
    ).get_text(strip=True)

    description = get_element_or_none(job, ".relative.overflow-hidden")
    # .get_text(
    #     separator="\n\n", strip=True
    # )

    return {
        "position": position,
        "company": company,
        "location": location,
        "company_logo": company_logo,
        "ago_time": ago_time,
        "applicants": applicants,
        "level": level,
        "type": type,
        "description": str(description),
    }


headers_list = {
    "chrome": {
        "Connection": "keep-alive",
        "Cache-Control": "max-age=0",
        "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36",
        "Accept": " text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
    },
    # "firefox": {
    #     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:98.0) Gecko/20100101 Firefox/98.0",
    #     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    #     "Accept-Language": "en-US,en;q=0.5",
    #     "Accept-Encoding": "gzip, deflate",
    #     "Connection": "keep-alive",
    #     "Upgrade-Insecure-Requests": "1",
    #     "Sec-Fetch-Dest": "document",
    #     "Sec-Fetch-Mode": "navigate",
    #     "Sec-Fetch-Site": "none",
    #     "Sec-Fetch-User": "?1",
    #     "Cache-Control": "max-age=0",
    # },
    "safari": {
        "Upgrade-Insecure-Requests": "1",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
        "Accept-Language": "en-gb",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
    },
    "edge": {
        "Connection": "keep-alive",
        "Cache-Control": "max-age=0",
        "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="99", "Microsoft Edge";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36 Edg/99.0.1150.30",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,fi;q=0.7",
    },
}

# Create ordered dict from Headers above
ordered_headers_list = {}
for key, headers in headers_list.items():
    h = OrderedDict()
    for header, value in headers.items():
        h[header] = value
    ordered_headers_list[key] = h

proxies = FreeProxy(elite=True, rand=True, country_id=["US", "BR"])

browsers = [  # Edge
    "edge99",
    "edge101",
    # Chrome
    "chrome99",
    "chrome100",
    "chrome101",
    "chrome104",
    "chrome107",
    "chrome110",
    "chrome116",
    "chrome119",
    "chrome120",
    "chrome123",
    "chrome124",
    # Safari
    "safari15_3",
    "safari15_5",
    "safari17_0",
]

options = Options(
    version_ranges={
        "chrome": VersionRange(min_version=99),
        "safari": VersionRange(min_version=16),
        "edge": VersionRange(min_version=99),
    }
)


async def async_request(client: AsyncSession, url, indx=0):
    retry = 0
    while retry < 20:
        # print(f"{indx}: {url}")
        proxy = proxies.get()
        type, type_headers = random.choice(list(ordered_headers_list.items()))
        headers = type_headers.copy()
        platform = (
            "windows"
            if type == "edge"
            else "macos" if type == "safari" else ("windows", "macos", "linux")
        )
        user_agent = ua_generator.generate(
            browser=type, platform=platform, options=options
        )
        ua_headers = user_agent.headers.get()
        ua_headers["User-Agent"] = ua_headers.pop("user-agent")

        for key, value in ua_headers.items():
            headers[key] = value

        version = ".".join(parse(user_agent.text).browser.version_string.split(".")[:2])

        if user_agent.platform == "android":
            filtered_browser = "chrome99_android"
        elif user_agent.platform == "ios":
            filtered_browser = "safari17_2_ios"
        else:
            try:
                filtered_browser = [
                    browser
                    for browser in browsers
                    if type in browser
                    and float(browser.replace(type, "").replace("_", "."))
                    <= float(version)
                ]
                if len(filtered_browser) > 0:
                    filtered_browser = filtered_browser[-1]
                else:
                    continue
            except Exception as e:
                print(e)
                print(type)
                print(platform)
                print(version)
                print(json.dumps(headers, indent=4))
                continue

        try:
            response = await client.get(
                url,
                impersonate=filtered_browser,
                headers=headers,
                proxies={"http": proxy.split("//")[1]},
            )
            if response.status_code == 200:
                # print(f"{indx} Success {user_agent.text}")
                # print(type)
                # print(platform)
                # print(version)
                # print(filtered_browser)
                # print(json.dumps(headers, indent=4))
                return (indx, response.text)
            else:
                # print(f"{indx} Failed")
                retry = retry + 1
        except Exception as e:
            # print(f"{indx}: Connection error {e}")
            retry = retry + 1
    return "Max retry reached"


async def get_url(url):
    async with AsyncSession() as s:
        response = await async_request(s, url)
        return response


async def get_urls(urls):
    async with AsyncSession(http_version=CurlHttpVersion.V1_1) as s:
        tasks = [async_request(s, url, indx) for indx, url in enumerate(urls)]
        responses = await asyncio.gather(*tasks)
        return responses


def get_date_since_posted(date_since_posted: str) -> str:
    date_range = {
        "past month": "r2592000",
        "past week": "r604800",
        "24hr": "r86400",
    }
    return date_range.get(date_since_posted, "")


def get_experience_level(experience_level: str) -> str:
    experience_range = {
        "internship": "1",
        "entry level": "2",
        "associate": "3",
        "senior": "4",
        "director": "5",
        "executive": "6",
    }
    return experience_range.get(experience_level, "")


def get_job_type(job_type: str = "") -> str:
    job_type_range = {
        "full time": "F",
        "full-time": "F",
        "part time": "P",
        "part-time": "P",
        "contract": "C",
        "temporary": "T",
        "volunteer": "V",
        "internship": "I",
    }
    return job_type_range.get(job_type, "")


def get_remote_filter(remote_filter: str = "") -> str:
    remote_filter_range = {
        "on-site": "1",
        "on site": "1",
        "remote": "2",
        "hybrid": "3",
    }
    return remote_filter_range.get(remote_filter.lower(), "")


def get_salary(salary: str = "") -> str:
    salary_range = {
        40000: "1",
        60000: "2",
        80000: "3",
        100000: "4",
        120000: "5",
    }
    try:
        salary_number = int(salary)
        return salary_range.get(salary_number, "")
    except ValueError:
        return ""


def get_job_list(
    keywords,
    location,
    date_since_posted,
    experience_level,
    remote_filter,
    job_type,
    sort_by,
):
    job_list_url = (
        f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?"
    )

    if keywords:
        job_list_url += f"keywords={keywords}"
    if location:
        job_list_url += f"&location={location}"
    if date_since_posted and get_date_since_posted(date_since_posted):
        job_list_url += f"&f_TPR={get_date_since_posted(date_since_posted)}"
    if experience_level and get_experience_level(experience_level):
        job_list_url += f"&f_E={get_experience_level(experience_level)}"
    if remote_filter and get_remote_filter(remote_filter):
        job_list_url += f"&f_WT={get_remote_filter(remote_filter)}"
    if job_type and get_job_type(job_type):
        job_list_url += f"&f_JT={get_job_type(job_type)}"

    job_list_url += f"&start={0}"

    if sort_by in ["recent", "relevant"]:
        sort_method = "R" if sort_by == "relevant" else "DD"
        job_list_url += f"&sortBy={sort_method}"

    job_list_response = asyncio.run(get_url(job_list_url))
    soup = BeautifulSoup(job_list_response[1], "html.parser")
    alljobs_on_this_page = soup.find_all("li")
    job_list = parse_job_list(alljobs_on_this_page)

    # job_details_response = asyncio.run(
    #     get_urls([job_details_url.format(job["id"]) for job in job_list])
    # )
    # for job in job_details_response:
    #     soup = BeautifulSoup(job[1], "html.parser")
    #     for key, value in parse_job_details(soup).items():
    #         job_list[job[0]][key] = value
    return job_list


def get_job_details(job_id):
    job_details_url = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{}"
    job_details_response = asyncio.run(get_url(job_details_url.format(job_id)))
    soup = BeautifulSoup(job_details_response[1], "html.parser")
    return parse_job_details(soup)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    subparser = parser.add_subparsers(dest="command")

    list_parser = subparser.add_parser("list")
    list_parser.add_argument(
        "--keywords",
        type=str,
        default=None,
        help='Keywords for the job search (e.g., "software engineer")',
    )
    list_parser.add_argument(
        "--location",
        type=str,
        default=None,
        help='Location for the job search (e.g., "New York")',
    )
    list_parser.add_argument(
        "--date_since_posted",
        type=str,
        choices=["past month", "past week", "24hr"],
        default=None,
        help='Date range for when the job was posted ("past month", "past week", "24hr")',
    )
    list_parser.add_argument(
        "--experience_level",
        type=str,
        choices=[
            "internship",
            "entry level",
            "associate",
            "senior",
            "director",
            "executive",
        ],
        default=None,
        help="Experience level required for the job",
    )
    list_parser.add_argument(
        "--remote_filter",
        type=str,
        choices=["on-site", "on site", "remote", "hybrid"],
        default=None,
        help='Remote work filter ("on-site", "remote", "hybrid")',
    )
    list_parser.add_argument(
        "--job_type",
        type=str,
        choices=[
            "internship",
            "full time",
            "full-time",
            "part time",
            "part-time",
            "contract",
            "temporary",
            "volunteer",
        ],
        default=None,
        help='Job type (e.g., "full-time", "contract")',
    )
    list_parser.add_argument(
        "--sort_by",
        type=str,
        choices=["recent", "relevant"],
        default=None,
        help='Sort results by "recent" or "relevant"',
    )

    details_parser = subparser.add_parser("details")
    details_parser.add_argument("id", type=str, help="Get job details by ID")

    args = parser.parse_args()

    if args.command == "list":
        print(
            json.dumps(
                get_job_list(
                    args.keywords,
                    args.location,
                    args.date_since_posted,
                    args.experience_level,
                    args.remote_filter,
                    args.job_type,
                    args.sort_by,
                ),
                indent=4,
            )
        )

    elif args.command == "details":
        print(json.dumps(get_job_details(args.id), indent=4))
