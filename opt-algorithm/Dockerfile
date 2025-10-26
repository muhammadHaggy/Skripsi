FROM python:3.9

RUN ln -sf /usr/share/zoneinfo/Asia/Jakarta /etc/localtime && echo "Asia/Jakarta" > /etc/timezone

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app



RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . /app/

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install ortools

WORKDIR /app/restful_routing_project

EXPOSE 8000

RUN pip list

# Run migrations before starting the development server
CMD sh -c "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"