FROM python:3.9

RUN ln -sf /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" > /etc/timezone

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Keep pip lightweight and avoid rich progress threads during install
RUN python -m pip install --no-cache-dir --progress-bar off --upgrade pip==24.3.1
ENV PIP_NO_CACHE_DIR=1 \
    PIP_PROGRESS_BAR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=1

COPY . /app/

RUN pip install --no-cache-dir --progress-bar off -r requirements.txt

WORKDIR /app/restful_routing_project

EXPOSE 8000

RUN pip list

# Run migrations before starting the development server
CMD sh -c "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"